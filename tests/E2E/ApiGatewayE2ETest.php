<?php

namespace App\Tests\E2E;

use App\Gateway\ApiAggregator;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class ApiGatewayE2ETest extends WebTestCase
{
    /**
     * Dans l'env de test, l'access_control est désactivé (config/packages/dev|prod).
     * On vérifie que l'endpoint répond et retourne bien du JSON structuré.
     */
    public function testProfileEndpointReturnsStructuredJson(): void
    {
        $client = static::createClient();

        $mock = $this->createMock(ApiAggregator::class);
        $mock->method('getUserProfile')->willReturn([
            'user'         => ['id' => 1, 'name' => 'Bryan Joubert'],
            'subscription' => ['plan' => 'Premium', 'status' => 'active'],
            'errors'       => [],
        ]);
        static::getContainer()->set(ApiAggregator::class, $mock);

        $client->request('GET', '/api/profile/1');

        $this->assertResponseIsSuccessful();
        $data = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('user', $data);
        $this->assertArrayHasKey('subscription', $data);
        $this->assertArrayHasKey('errors', $data);
    }

    /**
     * L'endpoint interne /internal/users/{id} retourne bien les données utilisateur.
     */
    public function testInternalUsersEndpointReturnsUser(): void
    {
        $client = static::createClient();
        $client->request('GET', '/internal/users/42');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('Content-Type', 'application/json');

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('id', $data);
        $this->assertArrayHasKey('name', $data);
        $this->assertArrayHasKey('email', $data);
        $this->assertEquals(42, $data['id']);
    }

    /**
     * L'endpoint interne /internal/subscription/{userId} retourne bien les données d'abonnement.
     */
    public function testInternalSubscriptionEndpointReturnsSubscription(): void
    {
        $client = static::createClient();
        $client->request('GET', '/internal/subscription/42');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('Content-Type', 'application/json');

        $data = json_decode($client->getResponse()->getContent(), true);

        $this->assertArrayHasKey('userId', $data);
        $this->assertArrayHasKey('plan', $data);
        $this->assertArrayHasKey('status', $data);
        $this->assertEquals(42, $data['userId']);
    }
}
