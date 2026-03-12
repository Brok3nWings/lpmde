<?php

namespace App\Tests\Unit;

use App\Message\GhostAlert;
use App\MessageHandler\GhostAlertHandler;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

class GhostAlertHandlerTest extends TestCase
{
    private function makeHandler(): GhostAlertHandler
    {
        return new GhostAlertHandler($this->createStub(LoggerInterface::class));
    }

    public function testHandlerHasAsMessageHandlerAttribute(): void
    {
        $reflection = new \ReflectionClass(GhostAlertHandler::class);
        $attributes = $reflection->getAttributes(AsMessageHandler::class);

        $this->assertNotEmpty($attributes, 'GhostAlertHandler doit avoir l\'attribut #[AsMessageHandler]');
    }

    public function testHandlerIsInvokable(): void
    {
        $this->assertTrue(is_callable($this->makeHandler()), 'GhostAlertHandler doit être callable (__invoke)');
    }

    public function testInvokeMethodAcceptsGhostAlert(): void
    {
        $reflection = new \ReflectionClass(GhostAlertHandler::class);
        $method     = $reflection->getMethod('__invoke');
        $params     = $method->getParameters();

        $this->assertCount(1, $params);
        $this->assertSame('alert', $params[0]->getName());
        $this->assertSame(GhostAlert::class, $params[0]->getType()->getName());
    }

    public function testHandlerLogsInfoOnReceivedAndProcessed(): void
    {
        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects($this->exactly(2))
               ->method('info');

        $handler = new GhostAlertHandler($logger);
        $alert   = new GhostAlert('Grenier', 'Vampire');

        ob_start();
        $handler($alert);
        ob_end_clean();
    }

    public function testHandlerOutputsAlertInfo(): void
    {
        $handler = $this->makeHandler();
        $alert   = new GhostAlert('Grenier', 'Vampire');

        ob_start();
        $handler($alert);
        $output = ob_get_clean();

        $this->assertStringContainsString('Vampire', $output);
        $this->assertStringContainsString('Grenier', $output);
    }
}
