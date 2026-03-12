<?php

namespace App\MessageHandler;

use App\Message\GhostAlert;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class GhostAlertHandler
{
    public function __construct(private LoggerInterface $logger) {}

    public function __invoke(GhostAlert $alert): void
    {
        $this->logger->info('GhostAlert reçue', [
            'monster'  => $alert->getMonsterType(),
            'location' => $alert->getLocation(),
        ]);

        // Simulation du traitement lourd
        sleep(5);

        $msg = sprintf(
            '👻 ALERTE TRAITÉE : Un %s a été vu dans : %s',
            $alert->getMonsterType(),
            $alert->getLocation()
        );

        $this->logger->info('GhostAlert traitée', [
            'monster'  => $alert->getMonsterType(),
            'location' => $alert->getLocation(),
        ]);

        echo $msg . "\n";
    }
}