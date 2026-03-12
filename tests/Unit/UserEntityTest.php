<?php

namespace App\Tests\Unit;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

class UserEntityTest extends TestCase
{
    private function makeUser(): User
    {
        $user = new User();
        $user->setEmail('test@example.com');
        $user->setUsername('testuser');
        $user->setKeycloakId('kc-123');
        return $user;
    }

    public function testGetIdIsNullByDefault(): void
    {
        $this->assertNull((new User())->getId());
    }

    public function testGetAndSetEmail(): void
    {
        $user = new User();
        $user->setEmail('alice@example.com');
        $this->assertSame('alice@example.com', $user->getEmail());
    }

    public function testGetUserIdentifierReturnsEmail(): void
    {
        $user = $this->makeUser();
        $this->assertSame('test@example.com', $user->getUserIdentifier());
    }

    public function testRolesAlwaysContainRoleUser(): void
    {
        $user = new User();
        $this->assertContains('ROLE_USER', $user->getRoles());
    }

    public function testSetRoles(): void
    {
        $user = new User();
        $user->setRoles(['ROLE_ADMIN']);
        $this->assertContains('ROLE_ADMIN', $user->getRoles());
        $this->assertContains('ROLE_USER', $user->getRoles());
    }

    public function testRolesAreUnique(): void
    {
        $user = new User();
        $user->setRoles(['ROLE_USER', 'ROLE_USER']);
        $roles = $user->getRoles();
        $this->assertSame(array_unique($roles), $roles);
    }

    public function testGetAndSetKeycloakId(): void
    {
        $user = new User();
        $user->setKeycloakId('kc-456');
        $this->assertSame('kc-456', $user->getKeycloakId());
    }

    public function testGetAndSetUsername(): void
    {
        $user = new User();
        $user->setUsername('johndoe');
        $this->assertSame('johndoe', $user->getUsername());
    }

    public function testGetAndSetFirstName(): void
    {
        $user = new User();
        $this->assertNull($user->getFirstName());
        $user->setFirstName('John');
        $this->assertSame('John', $user->getFirstName());
    }

    public function testGetAndSetLastName(): void
    {
        $user = new User();
        $this->assertNull($user->getLastName());
        $user->setLastName('Doe');
        $this->assertSame('Doe', $user->getLastName());
    }

    public function testGetFullNameWithBothNames(): void
    {
        $user = new User();
        $user->setUsername('johndoe');
        $user->setFirstName('John');
        $user->setLastName('Doe');
        $this->assertSame('John Doe', $user->getFullName());
    }

    public function testGetFullNameFallsBackToUsername(): void
    {
        $user = new User();
        $user->setUsername('johndoe');
        $this->assertSame('johndoe', $user->getFullName());
    }

    public function testEraseCredentialsDoesNothing(): void
    {
        $user = $this->makeUser();
        $user->eraseCredentials(); // Should not throw
        $this->assertTrue(true);
    }
}
