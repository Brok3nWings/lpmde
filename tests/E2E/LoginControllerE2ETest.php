<?php

namespace App\Tests\E2E;

use App\Message\GhostAlert;
use App\Message\UserLoginNotification;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\Messenger\Envelope;
use Symfony\Component\Messenger\MessageBusInterface;

class LoginControllerE2ETest extends WebTestCase
{
    // ─── GET /login ────────────────────────────────────────────────────────────

    public function testLoginPageReturns200(): void
    {
        $client = static::createClient();
        $client->request('GET', '/login');

        $this->assertResponseIsSuccessful();
    }

    public function testLoginPageContainsForm(): void
    {
        $client = static::createClient();
        $crawler = $client->request('GET', '/login');

        // Formulaire présent
        $this->assertGreaterThan(0, $crawler->filter('form')->count());
    }

    // ─── POST /do-login ────────────────────────────────────────────────────────

    public function testDoLoginDispatchesMessageAndRedirects(): void
    {
        $client = static::createClient();

        // Mock du MessageBus — vérifie que dispatch() est appelé
        $bus = $this->createMock(MessageBusInterface::class);
        $bus->expects($this->once())
            ->method('dispatch')
            ->with($this->isInstanceOf(UserLoginNotification::class))
            ->willReturnCallback(fn($msg) => new Envelope($msg));

        static::getContainer()->set(MessageBusInterface::class, $bus);

        $client->request('POST', '/do-login', ['username' => 'TestUser']);

        $this->assertResponseRedirects('/');
    }

    public function testDoLoginWithoutUsernameUsesDefault(): void
    {
        $client = static::createClient();

        $dispatched = [];
        $bus = $this->createMock(MessageBusInterface::class);
        $bus->expects($this->once())
            ->method('dispatch')
            ->willReturnCallback(function ($msg) use (&$dispatched) {
                $dispatched[] = $msg;
                return new Envelope($msg);
            });

        static::getContainer()->set(MessageBusInterface::class, $bus);

        $client->request('POST', '/do-login', []);

        $this->assertResponseRedirects('/');
        $this->assertCount(1, $dispatched);
        /** @var UserLoginNotification $notification */
        $notification = $dispatched[0];
        $this->assertSame('Utilisateur Anonyme', $notification->getUsername());
    }

    // ─── GET /test-rabbit ─────────────────────────────────────────────────────

    public function testRabbitDispatchesFiftyGhostAlerts(): void
    {
        $client = static::createClient();

        $count = 0;
        $bus = $this->createMock(MessageBusInterface::class);
        $bus->expects($this->exactly(50))
            ->method('dispatch')
            ->with($this->isInstanceOf(GhostAlert::class))
            ->willReturnCallback(function ($msg) use (&$count) {
                $count++;
                return new Envelope($msg);
            });

        static::getContainer()->set(MessageBusInterface::class, $bus);

        $client->request('GET', '/test-rabbit');

        $this->assertResponseIsSuccessful();
        $this->assertSame(50, $count);
        $this->assertStringContainsString('50', $client->getResponse()->getContent());
    }
}
