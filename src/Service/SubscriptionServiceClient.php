<?php

namespace App\Service;

use Symfony\Contracts\HttpClient\HttpClientInterface;

class SubscriptionServiceClient
{
    public function __construct(
        private HttpClientInterface $client,
        private string $subscriptionServiceUrl
    ) {}

    public function getSubscription(int $userId): array
    {
        $response = $this->client->request(
            'GET',
            $this->subscriptionServiceUrl . '/internal/subscription/' . $userId
        );

        return $response->toArray();
    }
}