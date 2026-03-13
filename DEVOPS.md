# Documentation DevOps — La Petite Maison de l'Épouvante

Ce document présente les outils DevOps utilisés dans le projet ainsi qu'une description détaillée de chaque étape du pipeline CI/CD GitHub Actions.

---

## Table des matières

1. [Outils DevOps utilisés](#1-outils-devops-utilisés)
2. [Pipeline CI/CD GitHub Actions](#2-pipeline-cicd-github-actions)
3. [Déclencheurs du pipeline](#3-déclencheurs-du-pipeline)
4. [Vue d'ensemble du pipeline](#4-vue-densemble-du-pipeline)
5. [Description détaillée des jobs](#5-description-détaillée-des-jobs)

---

## 1. Outils DevOps utilisés

### Intégration & livraison continues (CI/CD)

| Outil | Rôle |
|---|---|
| **GitHub Actions** | Moteur CI/CD hébergé sur GitHub. Orchestre l'ensemble du pipeline (tests, sécurité, build, déploiement). |
| **Self-hosted runner** | Agent GitHub Actions installé en local sur la machine de déploiement. Utilisé pour les jobs qui nécessitent un accès à Docker ou aux environnements de déploiement locaux (staging, production). |

### Conteneurisation

| Outil | Rôle |
|---|---|
| **Docker** | Permet de construire une image de l'application (`lpmde:latest`) et de l'exécuter dans des conteneurs isolés et reproductibles. |
| **Docker Compose** | Définit et orchestre les services multi-conteneurs (application web + base de données MySQL) pour le développement local et la production. |

### Gestion des dépendances

| Outil | Rôle |
|---|---|
| **Composer** | Gestionnaire de dépendances PHP. Installe les bibliothèques définies dans `composer.json` et génère l'autoloader optimisé. |
| **npm** | Gestionnaire de paquets Node.js, utilisé ici pour auditer les dépendances JavaScript du projet. |

### Tests

| Outil | Rôle |
|---|---|
| **PHPUnit** | Framework de tests unitaires et de tests End-to-End (E2E) pour PHP. Génère des rapports de couverture de code au format Cobertura (XML) et JUnit (XML). |
| **PCOV** | Extension PHP légère utilisée comme driver de couverture de code pour PHPUnit (alternative à Xdebug). |
| **k6** | Outil de tests de charge et de performance développé par Grafana Labs. Utilisé pour les smoke tests, les tests de montée en charge (load) et les tests de pic (spike). |

### Sécurité (SAST & SCA)

| Outil | Rôle |
|---|---|
| **npm audit** | Analyse les dépendances JavaScript et signale les vulnérabilités connues (SAST léger sur les paquets npm). |
| **Trivy** | Scanner de vulnérabilités open source d'Aqua Security. Utilisé en deux modes : analyse du système de fichiers (dépendances du projet) et analyse de l'image Docker construite. |
| **SonarCloud** | Plateforme d'analyse statique du code (SAST). Détecte les bugs, les mauvaises pratiques, les code smells et mesure la couverture de code. Intégré avec les rapports générés par PHPUnit. |

### Qualité du code

| Outil | Rôle |
|---|---|
| **SonarCloud** | Impose des seuils de qualité (*Quality Gate*) via `sonar.qualitygate.wait=true`. Le pipeline peut bloquer si le code ne respecte pas les critères définis (couverture, duplication, fiabilité…). |

### Infrastructure

| Outil | Rôle |
|---|---|
| **Kubernetes (k8s/)** | Manifestes de déploiement Kubernetes présents dans le dossier `k8s/` pour un déploiement cloud (Deployment, Service, Ingress, PVC, Jobs de migration). |
| **Keycloak** | Serveur d'authentification et d'autorisation (IAM). Géré via `docker-compose-keycloak.yml`. |

---

## 2. Pipeline CI/CD GitHub Actions

Le fichier de configuration se trouve dans `.github/workflows/ci-cd.yml`.

---

## 3. Déclencheurs du pipeline

Le pipeline se déclenche automatiquement dans deux cas :

- **`push`** sur les branches : `main`, `master`, `develop`, `bryan`
- **`pull_request`** ciblant ces mêmes branches

---

## 4. Vue d'ensemble du pipeline

```
install
   ├─── sast-npm-audit
   ├─── trivy-fs-audit
   └─── unit-test ────────── sonar-audit
         │
         └─── e2e-test
               │
               └─── k6-smoke-test
                     │
                     └─── build-image (self-hosted)
                           │
                           └─── trivy-image-scan (self-hosted)
                                 │
                                 └─── deploy-staging (self-hosted)
                                       │
                                       └─── deploy-production (self-hosted)
```

Le pipeline est organisé en **5 stages logiques** :
1. **Install** — Préparation de l'environnement
2. **Test / SAST** — Tests, couverture et analyses de sécurité
3. **Release** — Tests de performance et construction de l'image Docker
4. **Staging** — Déploiement et validation en environnement de pré-production
5. **Production** — Déploiement en production

---

## 5. Description détaillée des jobs

### Job `install` — Préparation de l'environnement

**Runner :** `ubuntu-latest`

Ce job est le point d'entrée du pipeline. Il prépare tous les artéfacts nécessaires aux jobs suivants.

| Étape | Description |
|---|---|
| **Checkout code** | Clone le dépôt Git sur le runner via `actions/checkout@v4`. |
| **Setup PHP** | Installe PHP 8.2 avec les extensions `pdo` et `pdo_mysql`, ainsi que Composer, grâce à `shivammathur/setup-php@v2`. |
| **Cache Composer dependencies** | Met en cache le dossier `vendor/` pour accélérer les exécutions futures. La clé de cache est calculée à partir du hash de `composer.lock`. |
| **Create .env file for CI** | Génère un fichier `.env` minimal avec `APP_ENV=test` et une `DATABASE_URL` PostgreSQL de test. |
| **Install dependencies** | Exécute `composer install` avec les options de performance (`--optimize-autoloader`, `--prefer-dist`, `--no-interaction`). |
| **Upload vendor artifact** | Publie le dossier `vendor/` en tant qu'artéfact GitHub (rétention 1 jour) pour être partagé avec les jobs suivants sans réinstallation. |

---

### Job `sast-npm-audit` — Audit de sécurité npm

**Runner :** `ubuntu-latest` | **Dépend de :** `install`

Analyse les dépendances JavaScript du projet à la recherche de vulnérabilités connues.

| Étape | Description |
|---|---|
| **Checkout code** | Clone le dépôt. |
| **Setup Node.js** | Installe Node.js 18 via `actions/setup-node@v4`. |
| **Run npm audit** | Exécute `npm audit --audit-level=moderate`. Le job ne bloque pas le pipeline (`continue-on-error: true`) mais signale les vulnérabilités de niveau modéré ou supérieur dans les logs. |

---

### Job `trivy-fs-audit` — Scan Trivy du système de fichiers

**Runner :** `ubuntu-latest` | **Dépend de :** `install`

Scanne le code source et les dépendances du projet (hors image Docker) à la recherche de CVE (Common Vulnerabilities and Exposures) de sévérité HIGH ou CRITICAL.

| Étape | Description |
|---|---|
| **Checkout code** | Clone le dépôt. |
| **Run Trivy vulnerability scanner** | Lance Trivy en mode `fs` (filesystem) sur l'ensemble du répertoire courant. Signale les vulnérabilités HIGH/CRITICAL sans bloquer le pipeline (`exit-code: '0'`). |

---

### Job `unit-test` — Tests unitaires avec couverture

**Runner :** `ubuntu-latest` | **Dépend de :** `install`

Exécute la suite de tests unitaires PHP et génère les rapports de couverture utilisés ensuite par SonarCloud.

| Étape | Description |
|---|---|
| **Checkout code** | Clone le dépôt. |
| **Create .env file for tests** | Génère le fichier `.env` de test. |
| **Download vendor artifact** | Récupère le dossier `vendor/` produit par le job `install`. |
| **Setup PHP** | Installe PHP 8.2 avec l'extension `pcov` (couverture de code) activée. |
| **Create log directory** | Crée le répertoire `var/log/` pour accueillir les rapports. |
| **Run unit tests with coverage** | Lance PHPUnit avec génération de la couverture au format Cobertura (`var/log/cobertura.xml`) et JUnit (`var/log/junit.xml`). |
| **Print coverage summary** | Affiche dans les logs le résumé de couverture (Classes / Methods / Lines). |
| **Upload test results** | Publie les fichiers `junit.xml` et `cobertura.xml` en tant qu'artéfacts pour SonarCloud. |

---

### Job `e2e-test` — Tests End-to-End

**Runner :** `ubuntu-latest` | **Dépend de :** `install`

Exécute les tests de bout en bout définis dans la suite `e2e` de PHPUnit.

| Étape | Description |
|---|---|
| **Checkout code** | Clone le dépôt. |
| **Create .env file for tests** | Génère le fichier `.env` de test. |
| **Download vendor artifact** | Récupère le dossier `vendor/`. |
| **Setup PHP** | Installe PHP 8.2 avec les extensions PDO. |
| **Run E2E tests** | Exécute `php bin/phpunit --testsuite=e2e --no-coverage`. Ce job est bloquant (`continue-on-error: false`) : un échec E2E arrête le pipeline. |

---

### Job `sonar-audit` — Analyse statique SonarCloud

**Runner :** `ubuntu-latest` | **Dépend de :** `unit-test`

Envoie le code source et les rapports de couverture vers SonarCloud pour l'analyse statique.

| Étape | Description |
|---|---|
| **Checkout code** | Clone le dépôt (fetch complet pour l'analyse Git). |
| **Download test artifacts** | Récupère les rapports `cobertura.xml` et `junit.xml` générés par `unit-test`. |
| **SonarCloud Scan** | Lance l'analyse via `SonarSource/sonarcloud-github-action`. Configure dynamiquement la clé de projet et l'organisation à partir des métadonnées GitHub. Transmet le rapport de couverture Cobertura à SonarCloud. |

---

### Job `k6-smoke-test` — Tests de fumée k6

**Runner :** `ubuntu-latest` | **Dépend de :** `unit-test` + `e2e-test`

Valide que l'application répond correctement sous une charge minimale avant la construction de l'image Docker.

| Étape | Description |
|---|---|
| **Checkout code** | Clone le dépôt. |
| **Create .env file** | Génère un `.env` de développement avec SQLite pour éviter une dépendance à une base de données externe. |
| **Setup PHP** | Installe PHP 8.2 avec l'extension `pdo_sqlite`. |
| **Download vendor artifact** | Récupère le dossier `vendor/`. |
| **Install k6** | Installe l'outil k6 via `grafana/setup-k6-action@v1`. |
| **Start PHP servers** | Démarre deux serveurs PHP intégrés (`localhost:8000` et `localhost:8001`) et vérifie leur disponibilité. |
| **Run k6 smoke test** | Exécute `load-tests/smoke-test.js` : 1 VU pendant 30 s, vérifie que les endpoints principaux répondent sans erreur 5xx. Les résultats sont sauvegardés en JSON. |
| **Upload k6 results** | Publie le fichier de résultats `k6-results.json` en artéfact. |

---

### Job `build-image` — Construction de l'image Docker

**Runner :** `self-hosted` | **Dépend de :** `unit-test` + `e2e-test` + `k6-smoke-test`

Construit l'image Docker de production sur la machine locale (self-hosted runner).

| Étape | Description |
|---|---|
| **Checkout code** | Clone le dépôt avec l'historique complet (`fetch-depth: 0`). |
| **Build Docker image locally** | Exécute `docker build -t lpmde:latest .`. Utilise le `Dockerfile` multi-stage : stage `composer` pour l'installation des dépendances, stage `php:8.2-apache` pour le runtime de production avec Apache, OPcache et toutes les extensions requises. |

---

### Job `trivy-image-scan` — Scan Trivy de l'image Docker

**Runner :** `self-hosted` | **Dépend de :** `build-image`

Scanne l'image Docker fraîchement construite pour détecter des vulnérabilités dans les couches de l'image (OS, bibliothèques système, dépendances applicatives).

| Étape | Description |
|---|---|
| **Run Trivy on local image** | Lance le conteneur Trivy avec accès au socket Docker (`/var/run/docker.sock`) pour scanner l'image `lpmde:latest`. Filtre sur les sévérités HIGH et CRITICAL. Le job ne bloque pas le pipeline (`exit-code 0`) mais les résultats sont visibles dans les logs. |

---

### Job `deploy-staging` — Déploiement en staging

**Runner :** `self-hosted` | **Dépend de :** `trivy-image-scan`  
**Environnement GitHub :** `staging` — URL : `http://localhost:8089`

Déploie l'image Docker sur l'environnement de pré-production local.

| Étape | Description |
|---|---|
| **Stop and remove existing staging container** | Arrête et supprime le conteneur `lpmde_staging` existant s'il tourne (`continue-on-error: true` pour le premier déploiement). |
| **Run staging container** | Lance un nouveau conteneur Docker (`lpmde_staging`) sur le port **8089**, avec `APP_ENV=prod`, `APP_SECRET` injecté depuis les secrets GitHub et une base SQLite. |
| **Health check staging** | Boucle de vérification (12 tentatives × 5 s) qui interroge `http://localhost:8089` jusqu'à obtenir une réponse HTTP valide. Le job échoue si l'application ne répond pas après 60 secondes. |

---

### Job `deploy-production` — Déploiement en production

**Runner :** `self-hosted` | **Dépend de :** `deploy-staging`  
**Environnement GitHub :** `production` — URL : `http://localhost:8088`

Déploie l'image Docker en production après validation du staging. Cet environnement peut être configuré avec une approbation manuelle dans les paramètres GitHub.

| Étape | Description |
|---|---|
| **Stop and remove existing container** | Arrête et supprime le conteneur `lpmde_prod` existant. |
| **Run updated container** | Lance le conteneur `lpmde_prod` sur le port **8088** avec la même configuration que le staging. |
| **Health check** | Même mécanisme de vérification que pour le staging, sur `http://localhost:8088`. Garantit que la production est opérationnelle avant de clôturer le pipeline. |

---

## Résumé visuel des responsabilités par outil

| Outil | Stage(s) concerné(s) |
|---|---|
| GitHub Actions | Tout le pipeline |
| Composer | Install |
| npm audit | SAST |
| PHPUnit + PCOV | Test (unitaire + E2E) |
| k6 | Release (smoke test) |
| Trivy | SAST (FS) + Release (image) |
| SonarCloud | SAST (après tests) |
| Docker | Release (build) + Staging + Production |
| Self-hosted runner | Release, Staging, Production |
