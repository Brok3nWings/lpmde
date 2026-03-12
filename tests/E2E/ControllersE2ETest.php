<?php

namespace App\Tests\E2E;

use App\Gateway\ApiAggregator;
use App\Repository\ProductRepository;
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
