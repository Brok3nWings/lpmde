<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class UserServiceClient
{
    public function __construct(
        private HttpClientInterface $client,
        private string $userServiceUrl
    ) {}

    public function getUser(int $id): array
    {
        $response = $this->client->request(
            'GET',
            $this->userServiceUrl . '/internal/users/' . $id
        );

        return $response->toArray();
    }
}