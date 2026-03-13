<?php

namespace App\Controller;

use App\Gateway\ApiAggregator;
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
    public function healthy(): JsonResponse
    {
        return $this->json([
            'status' => 'ok',
            'route'  => 'app_apigateway_profile',
            'path'   => '/api/profile/{id}',
            'method' => 'GET',
            'expected_response' => [
                'user' => [
                    'id'    => 1,
                    'name'  => 'Bryan Joubert',
                    'email' => 'bryan.joubert@gmail.com',
                ],
                'subscription' => [
                    'userId' => 1,
                    'plan'   => 'Premium',
                    'status' => 'active',
                ],
                'errors' => [],
            ],
        ]);
    }
}