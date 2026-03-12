<?php

namespace App\Tests\Unit;

use App\Entity\Product;
use PHPUnit\Framework\TestCase;

class ProductEntityTest extends TestCase
{
    public function testGetAndSetName(): void
    {
        $product = new Product();
        $this->assertNull($product->getName());

        $result = $product->setName('Test Product');
        $this->assertSame('Test Product', $product->getName());
        $this->assertInstanceOf(Product::class, $result); // fluent interface
    }

    public function testGetAndSetDescription(): void
    {
        $product = new Product();
        $this->assertNull($product->getDescription());

        $product->setDescription('A great product');
        $this->assertSame('A great product', $product->getDescription());
    }

    public function testGetAndSetPrice(): void
    {
        $product = new Product();
        $this->assertNull($product->getPrice());

        $product->setPrice(19.99);
        $this->assertSame(19.99, $product->getPrice());
    }

    public function testSetNullableValues(): void
    {
        $product = new Product();
        $product->setName(null);
        $product->setDescription(null);
        $product->setPrice(null);

        $this->assertNull($product->getName());
        $this->assertNull($product->getDescription());
        $this->assertNull($product->getPrice());
    }

    public function testGetIdIsNullByDefault(): void
    {
        $product = new Product();
        $this->assertNull($product->getId());
    }
}
