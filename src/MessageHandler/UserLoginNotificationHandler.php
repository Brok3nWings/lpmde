<?php

namespace App\MessageHandler;

use App\Message\UserLoginNotification;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class UserLoginNotificationHandler
{
    public function __construct(private LoggerInterface $logger) {}

    public function __invoke(UserLoginNotification $notification): void
    {
        $this->logger->info('UserLoginNotification reçue', [
            'username'   => $notification->getUsername(),
            'login_time' => $notification->getLoginTime()->format('H:i:s'),
        ]);

        // Simulation du traitement (email, BDD, etc.)
        sleep(2);

        $msg = sprintf(
            "✅ NOTIFICATION TRAITÉE : L'utilisateur '%s' s'est connecté à %s",
            $notification->getUsername(),
            $notification->getLoginTime()->format('H:i:s')
        );

        $this->logger->info('UserLoginNotification traitée', [
            'username' => $notification->getUsername(),
        ]);

        echo $msg . "\n";
    }
}
