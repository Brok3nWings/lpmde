<?php

namespace App\Command;

use App\Entity\Product;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'app:db:seed', description: 'Seed the database with initial data')]
class DbSeedCommand extends Command
{
    public function __construct(private EntityManagerInterface $em)
    {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $this->seedProducts($output);
        $this->seedUsers($output);

        return Command::SUCCESS;
    }

    private function seedProducts(OutputInterface $output): void
    {
        $count = $this->em->getRepository(Product::class)->count([]);
        if ($count > 0) {
            $output->writeln('Products already seeded, skipping.');
            return;
        }

        $products = [
            ['Potion de Soin',          'Restaure 50 points de vie instantanément.',                    9.99],
            ['Potion de Mana',           'Restaure 30 points de mana pour lancer des sorts.',            7.49],
            ['Épée de Feu',              'Lame enchantée infligeant des dégâts de feu supplémentaires.', 89.99],
            ['Bouclier de Cristal',      'Bouclier magique absorbant les projectiles ennemis.',          74.99],
            ['Arc Elfique',              'Arc léger taillé dans le bois des forêts anciennes.',          59.99],
            ['Botte de Célérité',        'Augmente la vitesse de déplacement de 20%.',                   34.99],
            ['Cape d Invisibilité',      'Rend le porteur invisible pendant 30 secondes.',               129.99],
            ['Amulette de Protection',   'Réduit les dégâts subis de 10%.',                             49.99],
            ['Grimoire des Arcanes',     'Contient 12 sorts rares de la magie ancienne.',                99.99],
            ['Dague Empoisonnée',        'Inflige un poison persistant sur 5 secondes.',                 44.99],
            ['Casque de Fer',            'Protection de base pour la tête, solide et fiable.',           19.99],
            ['Armure de Plates',         'Armure lourde offrant une protection maximale.',               149.99],
            ['Bague de Régénération',    'Régénère 2 points de vie par seconde.',                        39.99],
            ['Torche Éternelle',         'Ne s éteint jamais, même sous l eau.',                         14.99],
            ['Corde d Escalade',         '20 mètres de corde enchantée, résistante au feu.',             12.99],
            ['Flèches de Givre',         'Carquois de 20 flèches ralentissant les ennemis.',             24.99],
            ['Pierre de Téléportation', 'Téléporte l utilisateur à son dernier campement.',              79.99],
            ['Elixir de Force',          'Double la force du porteur pendant 1 minute.',                 54.99],
            ['Masque de Terreur',        'Inflige la peur aux ennemis proches lors du port.',            69.99],
            ['Lanterne des Âmes',        'Révèle les ennemis cachés dans un rayon de 10 mètres.',        84.99],
        ];

        foreach ($products as [$name, $description, $price]) {
            $product = new Product();
            $product->setName($name);
            $product->setDescription($description);
            $product->setPrice($price);
            $this->em->persist($product);
        }

        $this->em->flush();
        $output->writeln(sprintf('Inserted %d products.', count($products)));
    }

    private function seedUsers(OutputInterface $output): void
    {
        $count = $this->em->getRepository(User::class)->count([]);
        if ($count > 0) {
            $output->writeln('Users already seeded, skipping.');
            return;
        }

        $users = [
            [
                'email'       => 'alice.dupont@example.com',
                'username'    => 'alice',
                'firstName'   => 'Alice',
                'lastName'    => 'Dupont',
                'keycloakId'  => 'kc-user-001',
                'roles'       => ['ROLE_ADMIN'],
            ],
            [
                'email'       => 'bob.martin@example.com',
                'username'    => 'bob',
                'firstName'   => 'Bob',
                'lastName'    => 'Martin',
                'keycloakId'  => 'kc-user-002',
                'roles'       => ['ROLE_USER'],
            ],
            [
                'email'       => 'claire.leroy@example.com',
                'username'    => 'claire',
                'firstName'   => 'Claire',
                'lastName'    => 'Leroy',
                'keycloakId'  => 'kc-user-003',
                'roles'       => ['ROLE_USER'],
            ],
        ];

        foreach ($users as $data) {
            $user = new User();
            $user->setEmail($data['email']);
            $user->setUsername($data['username']);
            $user->setFirstName($data['firstName']);
            $user->setLastName($data['lastName']);
            $user->setKeycloakId($data['keycloakId']);
            $user->setRoles($data['roles']);
            $this->em->persist($user);
        }

        $this->em->flush();
        $output->writeln(sprintf('Inserted %d users.', count($users)));
    }
}
