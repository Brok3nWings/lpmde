<?php

namespace App\Tests\Unit;

use App\Service\SubscriptionServiceClient;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class SubscriptionServiceClientTest extends TestCase
{
    public function testGetSubscriptionCallsCorrectUrl(): void
    {
        $expectedData = ['userId' => 7, 'plan' => 'Premium', 'status' => 'active'];

        $response = $this->createMock(ResponseInterface::class);
        $response->method('toArray')->willReturn($expectedData);

        $httpClient = $this->createMock(HttpClientInterface::class);
        $httpClient
            ->expects($this->once())
            ->method('request')
            ->with('GET', 'http://service-b/internal/subscription/7')
            ->willReturn($response);

        $client = new SubscriptionServiceClient($httpClient, 'http://service-b');
        $result = $client->getSubscription(7);

        $this->assertSame($expectedData, $result);
    }

    public function testGetSubscriptionUsesConfiguredBaseUrl(): void
    {
        $response = $this->createMock(ResponseInterface::class);
        $response->method('toArray')->willReturn([]);

        $httpClient = $this->createMock(HttpClientInterface::class);
        $httpClient
            ->expects($this->once())
            ->method('request')
            ->with('GET', 'http://custom-sub:8080/internal/subscription/99')
            ->willReturn($response);

        $client = new SubscriptionServiceClient($httpClient, 'http://custom-sub:8080');
        $client->getSubscription(99);
    }
}
