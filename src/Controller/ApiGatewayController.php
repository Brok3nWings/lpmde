<?php

namespace App\Controller;

use App\Gateway\ApiAggregator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

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
}