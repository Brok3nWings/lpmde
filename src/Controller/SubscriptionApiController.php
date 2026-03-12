<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class SubscriptionApiController extends AbstractController
{
    #[Route('/internal/subscription/{userId}', methods: ['GET'])]
    public function getSubscription(int $userId): JsonResponse
    {
        return $this->json([
            "userId" => $userId,
            "plan" => "Premium",
            "status" => "active"
        ]);
    }
}