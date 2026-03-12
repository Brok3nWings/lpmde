<?php

namespace App\Tests\Unit;

use App\Message\GhostAlert;
use PHPUnit\Framework\TestCase;

class GhostAlertTest extends TestCase
{
    public function testConstructorAndGetters(): void
    {
        $alert = new GhostAlert('Grenier', 'Vampire');

        $this->assertSame('Grenier', $alert->getLocation());
        $this->assertSame('Vampire', $alert->getMonsterType());
    }

    public function testDifferentValues(): void
    {
        $alert = new GhostAlert('Cimetière', 'Zombi');

        $this->assertSame('Cimetière', $alert->getLocation());
        $this->assertSame('Zombi', $alert->getMonsterType());
    }

    public function testEmptyStrings(): void
    {
        $alert = new GhostAlert('', '');

        $this->assertSame('', $alert->getLocation());
        $this->assertSame('', $alert->getMonsterType());
    }
}
