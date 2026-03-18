<?php

namespace App\Controller;

use App\Gateway\ApiAggregator;
use App\Repository\ProductRepository;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class ApiGatewayController extends AbstractController
{
    #[Route('/api/profile/{id}', methods: ['GET'])]
    public function profile(
        int $id,
        ApiAggregator $aggregator
    ): JsonResponse {
        $data = $aggregator->getUserProfile($id);

        $hasErrors = !empty($data['errors']);

        return $this->json($data, $hasErrors ? 206 : 200);
    }

    #[Route('/healthy', name: 'app_healthy', methods: ['GET'])]
    public function healthy(Connection $connection, ProductRepository $productRepository): JsonResponse
    {
        try {
            $connection->executeQuery('SELECT 1');
            $dbStatus = 'ok';
        } catch (\Throwable $e) {
            return $this->json([
                'status'   => 'error',
                'database' => 'unreachable',
                'message'  => $e->getMessage(),
            ], 503);
        }

        $products = $productRepository->findAll();
        $productCount = count($products);
        $sampleProducts = array_map(
            fn($p) => ['id' => $p->getId(), 'name' => $p->getName(), 'price' => $p->getPrice()],
            array_slice($products, 0, 5)
        );

        return $this->json([
            'status'   => 'ok',
            'database' => $dbStatus,
            'products' => [
                'total'   => $productCount,
                'sample'  => $sampleProducts,
            ],
        ]);
    }
}
