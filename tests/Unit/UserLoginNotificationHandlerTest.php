<?php

namespace App\Tests\Unit;

use App\Message\UserLoginNotification;
use App\MessageHandler\UserLoginNotificationHandler;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

class UserLoginNotificationHandlerTest extends TestCase
{
    private function makeHandler(): UserLoginNotificationHandler
    {
        return new UserLoginNotificationHandler($this->createStub(LoggerInterface::class));
    }

    public function testHandlerHasAsMessageHandlerAttribute(): void
    {
        $reflection = new \ReflectionClass(UserLoginNotificationHandler::class);
        $attributes = $reflection->getAttributes(AsMessageHandler::class);

        $this->assertNotEmpty($attributes, 'UserLoginNotificationHandler doit avoir l\'attribut #[AsMessageHandler]');
    }

    public function testHandlerIsInvokable(): void
    {
        $this->assertTrue(is_callable($this->makeHandler()), 'UserLoginNotificationHandler doit être callable (__invoke)');
    }

    public function testInvokeMethodAcceptsUserLoginNotification(): void
    {
        $reflection = new \ReflectionClass(UserLoginNotificationHandler::class);
        $method     = $reflection->getMethod('__invoke');
        $params     = $method->getParameters();

        $this->assertCount(1, $params);
        $this->assertSame('notification', $params[0]->getName());
        $this->assertSame(UserLoginNotification::class, $params[0]->getType()->getName());
    }

    public function testHandlerLogsInfoOnReceivedAndProcessed(): void
    {
        $logger = $this->createMock(LoggerInterface::class);
        $logger->expects($this->exactly(2))
               ->method('info');

        $handler      = new UserLoginNotificationHandler($logger);
        $notification = new UserLoginNotification('alice');

        ob_start();
        $handler($notification);
        ob_end_clean();
    }

    public function testHandlerOutputsNotificationInfo(): void
    {
        $handler      = $this->makeHandler();
        $notification = new UserLoginNotification('alice');

        ob_start();
        $handler($notification);
        $output = ob_get_clean();

        $this->assertStringContainsString('alice', $output);
    }
}
