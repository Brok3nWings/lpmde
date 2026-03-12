<?php

namespace App\Tests\Unit;

use App\Service\UserServiceClient;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class UserServiceClientTest extends TestCase
{
    public function testGetUserCallsCorrectUrl(): void
    {
        $expectedData = ['id' => 5, 'name' => 'Alice', 'email' => 'alice@example.com'];

        $response = $this->createMock(ResponseInterface::class);
        $response->method('toArray')->willReturn($expectedData);

        $httpClient = $this->createMock(HttpClientInterface::class);
        $httpClient
            ->expects($this->once())
            ->method('request')
            ->with('GET', 'http://service-a/internal/users/5')
            ->willReturn($response);

        $client = new UserServiceClient($httpClient, 'http://service-a');
        $result = $client->getUser(5);

        $this->assertSame($expectedData, $result);
    }

    public function testGetUserUsesConfiguredBaseUrl(): void
    {
        $response = $this->createMock(ResponseInterface::class);
        $response->method('toArray')->willReturn([]);

        $httpClient = $this->createMock(HttpClientInterface::class);
        $httpClient
            ->expects($this->once())
            ->method('request')
            ->with('GET', 'http://custom-host:9000/internal/users/42')
            ->willReturn($response);

        $client = new UserServiceClient($httpClient, 'http://custom-host:9000');
        $client->getUser(42);
    }
}
