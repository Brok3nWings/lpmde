<?php

namespace App\Tests\Unit;

use App\Gateway\ApiAggregator;
use App\Service\UserServiceClient;
use App\Service\SubscriptionServiceClient;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpClient\Exception\TransportException;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;

class ApiAggregatorTest extends TestCase
{
    /**
     * Crée un mock de CacheInterface qui exécute toujours le callback (pas de cache HIT)
     * ou retourne directement une valeur si $cachedValue est fournie (cache HIT).
     */
    private function makeCache(?array $cachedValue = null): CacheInterface
    {
        $cache = $this->createMock(CacheInterface::class);
        $cache->method('get')->willReturnCallback(function (string $key, callable $callback) use ($cachedValue) {
            if ($cachedValue !== null) {
                return $cachedValue;
            }
            $item = $this->createMock(ItemInterface::class);
            $item->method('expiresAfter')->willReturnSelf();
            return $callback($item);
        });
        return $cache;
    }

    public function testGetUserProfileAggregatesBothServices(): void
    {
        $userClient = $this->createMock(UserServiceClient::class);
        $userClient->method('getUser')->with(1)->willReturn(['id' => 1, 'name' => 'Alice']);

        $subClient = $this->createMock(SubscriptionServiceClient::class);
        $subClient->method('getSubscription')->with(1)->willReturn(['plan' => 'Premium']);

        $aggregator = new ApiAggregator($userClient, $subClient, $this->makeCache(), $this->createStub(LoggerInterface::class));
        $result = $aggregator->getUserProfile(1);

        $this->assertEquals(['id' => 1, 'name' => 'Alice'], $result['user']);
        $this->assertEquals(['plan' => 'Premium'], $result['subscription']);
        $this->assertEmpty($result['errors']);
    }

    public function testGetUserProfileHandlesUserServiceFailure(): void
    {
        $userClient = $this->createMock(UserServiceClient::class);
        $userClient->method('getUser')->willThrowException(new TransportException('Connection refused'));

        $subClient = $this->createMock(SubscriptionServiceClient::class);
        $subClient->method('getSubscription')->willReturn(['plan' => 'Premium']);

        $aggregator = new ApiAggregator($userClient, $subClient, $this->makeCache(), $this->createStub(LoggerInterface::class));
        $result = $aggregator->getUserProfile(1);

        $this->assertNull($result['user']);
        $this->assertEquals(['plan' => 'Premium'], $result['subscription']);
        $this->assertArrayHasKey('user', $result['errors']);
        $this->assertStringContainsString('indisponible', $result['errors']['user']);
    }

    public function testGetUserProfileHandlesSubscriptionServiceFailure(): void
    {
        $userClient = $this->createMock(UserServiceClient::class);
        $userClient->method('getUser')->willReturn(['id' => 1, 'name' => 'Alice']);

        $subClient = $this->createMock(SubscriptionServiceClient::class);
        $subClient->method('getSubscription')->willThrowException(new TransportException('Timeout'));

        $aggregator = new ApiAggregator($userClient, $subClient, $this->makeCache(), $this->createStub(LoggerInterface::class));
        $result = $aggregator->getUserProfile(1);

        $this->assertEquals(['id' => 1, 'name' => 'Alice'], $result['user']);
        $this->assertNull($result['subscription']);
        $this->assertArrayHasKey('subscription', $result['errors']);
    }

    public function testGetUserProfileReturnsNullsWhenBothServicesFail(): void
    {
        $userClient = $this->createMock(UserServiceClient::class);
        $userClient->method('getUser')->willThrowException(new TransportException('Unreachable'));

        $subClient = $this->createMock(SubscriptionServiceClient::class);
        $subClient->method('getSubscription')->willThrowException(new TransportException('Unreachable'));

        $aggregator = new ApiAggregator($userClient, $subClient, $this->makeCache(), $this->createStub(LoggerInterface::class));
        $result = $aggregator->getUserProfile(1);

        $this->assertNull($result['user']);
        $this->assertNull($result['subscription']);
        $this->assertArrayHasKey('user', $result['errors']);
        $this->assertArrayHasKey('subscription', $result['errors']);
    }

    public function testGetUserProfileUsesCacheOnSecondCall(): void
    {
        $cached = [
            'user'         => ['id' => 1, 'name' => 'Alice'],
            'subscription' => ['plan' => 'Free'],
            'errors'       => [],
        ];

        // Simule un cache HIT : les clients ne doivent jamais être appelés
        $userClient = $this->createMock(UserServiceClient::class);
        $userClient->expects($this->never())->method('getUser');

        $subClient = $this->createMock(SubscriptionServiceClient::class);
        $subClient->expects($this->never())->method('getSubscription');

        $aggregator = new ApiAggregator($userClient, $subClient, $this->makeCache($cached), $this->createStub(LoggerInterface::class));
        $result = $aggregator->getUserProfile(1);

        $this->assertEquals($cached, $result);
    }
}
