<?php

namespace App\Tests\E2E;

use App\Entity\Product;
use App\Gateway\ApiAggregator;
use App\Repository\ProductRepository;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ControllersE2ETest extends WebTestCase
{
    // ─── HomeController ────────────────────────────────────────────────────────

    public function testHomePageReturns200(): void
    {
        $client = static::createClient();
        $client->request('GET', '/');

        $this->assertResponseIsSuccessful();
    }

    // ─── ApiGatewayController ──────────────────────────────────────────────────

    public function testApiProfileReturns200WhenNoErrors(): void
    {
        $client = static::createClient();

        $mockAggregator = $this->createMock(ApiAggregator::class);
        $mockAggregator->method('getUserProfile')->with(1)->willReturn([
            'user'         => ['id' => 1, 'name' => 'Alice'],
            'subscription' => ['plan' => 'Premium', 'status' => 'active'],
            'errors'       => [],
        ]);

        static::getContainer()->set(ApiAggregator::class, $mockAggregator);

        $client->request('GET', '/api/profile/1');

        $this->assertResponseIsSuccessful();
        $this->assertResponseStatusCodeSame(200);

        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame(['id' => 1, 'name' => 'Alice'], $data['user']);
        $this->assertSame('Premium', $data['subscription']['plan']);
        $this->assertEmpty($data['errors']);
    }

    public function testApiProfileReturns206WhenServiceHasErrors(): void
    {
        $client = static::createClient();

        $mockAggregator = $this->createMock(ApiAggregator::class);
        $mockAggregator->method('getUserProfile')->with(2)->willReturn([
            'user'         => null,
            'subscription' => ['plan' => 'Free'],
            'errors'       => ['user' => 'Service utilisateur indisponible'],
        ]);

        static::getContainer()->set(ApiAggregator::class, $mockAggregator);

        $client->request('GET', '/api/profile/2');

        $this->assertResponseStatusCodeSame(206);

        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertNull($data['user']);
        $this->assertNotEmpty($data['errors']);
    }

    // ─── HealthController ──────────────────────────────────────────────────────

    public function testHealthyReturnsOkWithDatabaseData(): void
    {
        $client = static::createClient();

        $product = new Product();
        $product->setName('Potion de terreur');
        $product->setPrice(9.99);

        $mockRepo = $this->createMock(ProductRepository::class);
        $mockRepo->method('findAll')->willReturn([$product]);

        $mockConnection = $this->createMock(Connection::class);
        $mockConnection->expects($this->once())->method('executeQuery')->with('SELECT 1');

        static::getContainer()->set(ProductRepository::class, $mockRepo);
        static::getContainer()->set(Connection::class, $mockConnection);

        $client->request('GET', '/healthy');

        $this->assertResponseIsSuccessful();
        $this->assertResponseStatusCodeSame(200);

        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('ok', $data['status']);
        $this->assertSame('ok', $data['database']);
        $this->assertSame(1, $data['products']['total']);
        $this->assertSame('Potion de terreur', $data['products']['sample'][0]['name']);
    }

    public function testHealthyReturns503WhenDatabaseUnreachable(): void
    {
        $client = static::createClient();

        $mockConnection = $this->createMock(Connection::class);
        $mockConnection->method('executeQuery')->willThrowException(new \RuntimeException('Connection refused'));

        static::getContainer()->set(Connection::class, $mockConnection);

        $client->request('GET', '/healthy');

        $this->assertResponseStatusCodeSame(503);

        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame('error', $data['status']);
        $this->assertSame('unreachable', $data['database']);
    }

    // ─── ProductController ─────────────────────────────────────────────────────

    public function testProductListReturnsJsonArray(): void
    {
        $client = static::createClient();

        $mockRepo = $this->createMock(ProductRepository::class);
        $mockRepo->method('findAll')->willReturn([]);

        static::getContainer()->set(ProductRepository::class, $mockRepo);

        $client->request('GET', '/api/products');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('Content-Type', 'application/json');
    }
}
