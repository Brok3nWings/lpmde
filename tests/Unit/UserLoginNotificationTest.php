<?php

namespace App\Tests\Unit;

use App\Message\UserLoginNotification;
use PHPUnit\Framework\TestCase;

class UserLoginNotificationTest extends TestCase
{
    public function testGetUsername(): void
    {
        $notification = new UserLoginNotification('alice');

        $this->assertSame('alice', $notification->getUsername());
    }

    public function testGetLoginTimeIsRecentDateTimeImmutable(): void
    {
        $before       = new \DateTimeImmutable();
        $notification = new UserLoginNotification('bob');
        $after        = new \DateTimeImmutable();

        $loginTime = $notification->getLoginTime();

        $this->assertInstanceOf(\DateTimeInterface::class, $loginTime);
        $this->assertGreaterThanOrEqual($before->getTimestamp(), $loginTime->getTimestamp());
        $this->assertLessThanOrEqual($after->getTimestamp(), $loginTime->getTimestamp());
    }

    public function testTwoInstancesHaveIndependentLoginTimes(): void
    {
        $a = new UserLoginNotification('alice');
        $b = new UserLoginNotification('bob');

        $this->assertNotSame($a->getLoginTime(), $b->getLoginTime());
    }
}
