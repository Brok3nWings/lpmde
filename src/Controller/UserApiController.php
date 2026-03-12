<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

class UserApiController extends AbstractController
{
    #[Route('/internal/users/{id}', methods: ['GET'])]
    public function user(int $id): JsonResponse
    {
        return $this->json([
            "id" => $id,
            "name" => "Bryan Joubert",
            "email" => "bryan.joubert@gmail.com"
        ]);
    }
}