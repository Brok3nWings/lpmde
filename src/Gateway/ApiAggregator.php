<?php

namespace App\Gateway;

use App\Service\UserServiceClient;
use App\Service\SubscriptionServiceClient;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\HttpClient\Exception\HttpExceptionInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;

class ApiAggregator
{
    public function __construct(
        private UserServiceClient $userService,
        private SubscriptionServiceClient $subscriptionService,
        private CacheInterface $cache,
        private LoggerInterface $logger
    ) {}

    public function getUserProfile(int $id): array
    {
        return $this->cache->get('profile_' . $id, function (ItemInterface $item) use ($id) {
            $item->expiresAfter(60);

            $user = null;
            $subscription = null;
            $errors = [];

            try {
                $user = $this->userService->getUser($id);
                $this->logger->info('BFF: utilisateur récupéré', ['user_id' => $id]);
            } catch (HttpExceptionInterface | TransportExceptionInterface $e) {
                $errors['user'] = 'Service utilisateur indisponible : ' . $e->getMessage();
                $item->expiresAfter(0); // Ne pas mettre en cache les erreurs
                $this->logger->error('BFF: service utilisateur en erreur', [
                    'user_id' => $id,
                    'error'   => $e->getMessage(),
                ]);
            }

            try {
                $subscription = $this->subscriptionService->getSubscription($id);
                $this->logger->info('BFF: abonnement récupéré', ['user_id' => $id]);
            } catch (HttpExceptionInterface | TransportExceptionInterface $e) {
                $errors['subscription'] = 'Service abonnement indisponible : ' . $e->getMessage();
                $item->expiresAfter(0);
                $this->logger->error('BFF: service abonnement en erreur', [
                    'user_id' => $id,
                    'error'   => $e->getMessage(),
                ]);
            }

            return [
                'user'         => $user,
                'subscription' => $subscription,
                'errors'       => $errors,
            ];
        });
    }
}