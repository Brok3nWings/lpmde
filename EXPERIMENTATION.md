# Protocole d'expérimentation technologique — La Petite Maison de l'Épouvante

> Ce document décrit les expérimentations menées en bac à sable pour valider les technologies critiques avant leur intégration dans le prototype.

---

## Expérimentation 1 — API Gateway / BFF Pattern (Backend For Frontend)

### Objectif
Valider la faisabilité d'un Backend For Frontend capable d'agréger plusieurs micro-services internes avec gestion du cache et des erreurs partielles (résilience).

### Environnement de test
- PHP 8.2.12 (XAMPP Windows)
- Symfony 6.4
- 2 serveurs PHP intégrés : `localhost:8000` (BFF / gateway) et `localhost:8001` (services internes stub)

### Étapes clés pour reproduire

1. Créer `src/Gateway/ApiAggregator.php` avec injection de `UserServiceClient` et `SubscriptionServiceClient`
2. Implémenter les appels HTTP via `HttpClientInterface` Symfony (timeout 3s)
3. Ajouter le cache avec `CacheInterface` (TTL 60s, clé `user_profile_{id}`)
4. Gérer les erreurs partielles : si un service échoue → réponse HTTP 206 avec champ `errors`
5. Démarrer les deux serveurs :
   ```powershell
   php -S localhost:8000 -t public  # Terminal 1
   php -S localhost:8001 -t public  # Terminal 2
   ```
6. Appeler `GET /api/profile/1` et observer la réponse agrégée

### Résultats obtenus
- **HTTP 200** : les deux services répondent → réponse agrégée complète avec `user` + `subscription`
- **HTTP 206** : un service en erreur → réponse partielle + log `ERROR` avec contexte `user_id`
- Cache : 2ème appel ≈ 10× plus rapide (pas de requête HTTP vers les services internes)
- Couverture testée par `ApiAggregatorTest` (5 tests)

### Difficultés rencontrées
- **Deadlock initial** : le BFF sur port 8000 appelait ses propres routes `/internal/…` en boucle (le serveur ne peut pas se requêter lui-même) → résolution en séparant les deux serveurs PHP sur des ports distincts
- **Erreur 500 en Docker** avec `APP_ENV=dev` : le DebugBundle est absent car `composer install --no-dev` → résolution en passant `APP_ENV=prod` dans Docker

### Limites identifiées
- Les services internes sont des stubs locaux : en production réelle, il faudrait un service mesh (Istio/Linkerd) pour la découverte de services et le circuit breaker
- Le cache est filesystem (local) : en multi-instance Kubernetes, remplacer par Redis pour partager l'état

### Conclusion
✅ **Technologie adoptée** — Le pattern BFF avec Symfony HttpClient est viable et démontré fonctionnellement. Les tests unitaires protègent les comportements nominal et dégradé.

---

## Expérimentation 2 — Authentification Keycloak (OAuth2 / OIDC — Authorization Code Flow)

### Objectif
Valider l'intégration de Keycloak comme serveur d'autorisation OAuth2/OIDC dans une application Symfony, avec gestion du callback CSRF et persistance utilisateur via `keycloakId`.

### Environnement de test
- Keycloak 20+ via Docker (`docker-compose-keycloak.yml`, port 8080)
- PostgreSQL 15 comme backend Keycloak
- Symfony 6.4 avec `KeycloakService` custom (Authorization Code Flow)
- `docker compose -f docker-compose-keycloak.yml up -d`

### Étapes clés pour reproduire

1. Démarrer Keycloak + PostgreSQL
2. Configurer le realm, client OAuth2 (`symfony-app`), redirect URI `http://localhost:8000/login/keycloak/callback`
3. Implémenter le flow :
   - `GET /login/keycloak/redirect` → génère un `state` CSRF, redirige vers Keycloak
   - `GET /login/keycloak/callback` → valide le `state`, échange le `code` contre un access token
   - Extraire les claims JWT (`sub`, `email`, `preferred_username`)
   - Upsert de l'entité `User` avec `keycloakId`
4. Dispatcher `UserLoginNotification` après authentification réussie

### Résultats obtenus
- Flow Authorization Code avec protection CSRF fonctionnel
- Utilisateur créé ou mis à jour en base à partir des claims JWT
- Message `UserLoginNotification` dispatché après chaque connexion réussie
- Fichier de configuration Keycloak documenté dans `KEYCLOAK_SETUP.md`

### Difficultés rencontrées
- La route `/api/*` en `dev/security.yaml` avait `ROLE_USER` ce qui bloquait les tests du BFF en développement → résolution : `access_control: []` en dev uniquement (prod non impacté)
- Keycloak nécessite un PostgreSQL sain avant de démarrer → gestion via `depends_on: condition: service_healthy` dans le compose

### Limites identifiées
- Le flow de déconnexion (end session endpoint Keycloak) n'est pas encore implémenté
- La rotation des tokens (refresh token) n'est pas gérée dans ce prototype
- En production : envisager `knpuniversity/oauth2-client-bundle` pour une intégration plus robuste et moins de code custom

### Conclusion
✅ **Technologie adoptée** — Keycloak est validé comme serveur d'autorisation. Le flow Authorization Code avec protection CSRF est opérationnel et démontrable.

---

## Expérimentation 3 — Messagerie asynchrone (Symfony Messenger + RabbitMQ)

### Objectif
Valider la publication et la consommation de messages via Symfony Messenger avec deux transports : `sync://` (développement sans infrastructure) et AMQP/RabbitMQ (production).

### Environnement de test
- Symfony Messenger 6.4
- Transport `sync://` configuré dans `.env.local` (dev sans RabbitMQ)
- RabbitMQ disponible via `docker-compose.yml` pour les tests de transport AMQP
- Tests avec 50 messages `GhostAlert` en rafale + `UserLoginNotification`

### Étapes clés pour reproduire

1. Déclarer les messages `GhostAlert` et `UserLoginNotification` (value objects)
2. Implémenter les handlers avec `LoggerInterface` injecté
3. Configurer `.env.local` : `MESSENGER_TRANSPORT_DSN=sync://`
4. Test rafale : `POST /test-rabbit` dispatche 50 messages `GhostAlert` simultanément
5. Test notification : `POST /do-login` avec `username=BryanDemo` déclenche le flow complet
6. Observer les logs :
   ```powershell
   Get-Content var/log/dev.log | Select-String "UserLogin" | Select-Object -Last 10
   ```

### Résultats obtenus
- En mode `sync://` : 50 messages traités dans la même requête (~250ms total)
- 4 lignes de log par message : envoi, réception, traitement, confirmation
- En mode AMQP réel : messages en file, consommation via `php bin/console messenger:consume async`

```
messenger.INFO: Sending message App\Message\UserLoginNotification
messenger.INFO: Received message App\Message\UserLoginNotification
app.INFO: UserLoginNotification reçue {"username":"BryanDemo","login_time":"..."}
app.INFO: UserLoginNotification traitée {"username":"BryanDemo"}
```

### Difficultés rencontrées
- Sans RabbitMQ démarré et sans `sync://`, l'application plante au dispatch → résolution systématique par `.env.local`
- Les `sleep()` dans les handlers (simulation de traitement long) ralentissaient les tests CI → accepté pour la démo

### Limites identifiées
- Le mode `sync://` ne démontre pas le vrai asynchronisme (traitement différé) : un worker dédié (`messenger:consume`) est nécessaire en production
- Pas de dead letter queue (DLQ) configurée : les messages en erreur sont perdus en production

### Conclusion
✅ **Technologie adoptée** — Symfony Messenger est validé pour la gestion asynchrone d'événements. La transition dev (`sync://`) → prod (AMQP) est transparente pour le code applicatif.

---

## Expérimentation 4 — Pipeline CI/CD (GitHub Actions + k6 + Trivy + SonarCloud)

### Objectif
Valider un pipeline CI/CD complet intégrant : tests automatisés, qualité de code (SonarCloud), scan de sécurité (Trivy), tests de charge (k6), build Docker et déploiement.

### Environnement de test
- GitHub Actions (Ubuntu 22.04 runners)
- Docker Hub (registry d'images)
- SonarCloud (analyse statique PHP)
- Trivy (scan CVE filesystem + image)
- k6 intégré via `grafana/setup-k6-action@v1`

### Étapes clés pour reproduire

1. Définir le pipeline YAML `.github/workflows/ci-cd.yml` avec la chaîne :
   `install → [sast, sonar, trivy-fs, unit-test, e2e-test] → k6-smoke-test → build-image → trivy-image-scan → deploy-staging → deploy-production`
2. Déclencher sur les branches cibles (dont `bryan`) via `on: push: branches:`
3. Configurer les secrets GitHub : `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `SONAR_TOKEN`
4. Vérifier les artefacts : coverage XML, k6 JSON, SARIF Trivy

### Résultats obtenus
- Pipeline complet s'exécute en ~8-12 minutes (jobs parallèles pour les audits)
- k6 smoke test : 35/35 checks, 0% erreurs, p(95) < 2000ms
- SARIF Trivy visible dans l'onglet Security de GitHub
- Coverage summary affiché dans les logs CI :
  ```
  Classes: 78.95%  Methods: 74.60%  Lines: 59.11%
  ```

### Difficultés rencontrées
- **GPG keyserver inaccessible** dans l'environnement CI pour l'installation de k6 → remplacement par l'action officielle Grafana `grafana/setup-k6-action@v1`
- **SonarCloud** exige `sonar.organization` non défini initialement → ajout de `-Dsonar.organization=${{ github.repository_owner }}` dans le workflow et dans `sonar-project.properties`
- **Pipeline non déclenché** sur la branche `bryan` → ajout de la branche dans les triggers `on: push: branches:`

### Limites identifiées
- Le déploiement K8s en staging nécessite un cluster accessible depuis GitHub Actions (kubeconfig secret) — non configuré dans ce prototype
- SonarCloud nécessite un secret `SONAR_TOKEN` dans les secrets du dépôt GitHub pour publier les résultats (sans lui, le scan s'exécute mais avec `continue-on-error: true`)

### Conclusion
✅ **Technologie adoptée** — Le pipeline CI/CD est fonctionnel. Les 4 catégories de vérifications (tests, qualité, sécurité, charge) sont intégrées et tracées.

---

## Expérimentation 5 — Conteneurisation Docker + déploiement Kubernetes

### Objectif
Valider le packaging de l'application Symfony en image Docker production et son déploiement reproductible via des manifests Kubernetes.

### Environnement de test
- Docker Desktop (Windows)
- Image base : `php:8.2-apache`
- Manifests dans `k8s/` : `deployment.yaml`, `service.yaml`, `ingress.yaml`, `postgres-deployment.yaml`, `migration-job.yaml`

### Étapes clés pour reproduire

1. Build :
   ```powershell
   docker build -t lpmde:latest .
   ```
2. Test local :
   ```powershell
   docker run --rm -p 8088:80 `
     -e APP_ENV=prod `
     -e APP_SECRET=demo_secret_minimum_32_chars_ok `
     -e DATABASE_URL="sqlite:////var/www/html/var/test.db" `
     --name lpmde_demo lpmde:latest
   ```
3. Vérification :
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:8088/" -UseBasicParsing | Select StatusCode
   # → StatusCode : 200
   ```
4. Déploiement K8s (Minikube) :
   ```bash
   kubectl apply -f k8s/
   kubectl get pods -w
   ```

### Résultats obtenus
- Image construite avec succès : 1,19 GB (PHP 8.2 + Apache + dépendances Composer production)
- Conteneur répond HTTP 200 avec `APP_ENV=prod` après ~5-6 secondes d'initialisation
- Manifests K8s valides : Deployment (2 réplicas), Service ClusterIP, Ingress NGINX, PostgreSQL avec PersistentVolumeClaim

### Difficultés rencontrées
- Avec `APP_ENV=dev` le conteneur retourne 500 (DebugBundle absent car `--no-dev`) → `APP_ENV=prod` obligatoire dans tous les contextes Docker
- Le conteneur nécessite ~5-6 secondes avant de répondre (initialisation Apache + Symfony kernel) → prévoir un readiness probe K8s (`httpGet /` après 10s)

### Limites identifiées
- L'image (1,19 GB) est volumineuse : une image Alpine ou l'utilisation de FrankenPHP réduirait cela à ~200-300 MB
- Le secret `APP_SECRET` est passé en variable d'environnement dans la démo → en production Kubernetes, utiliser un `Secret` K8s monté en variable d'environnement

### Conclusion
✅ **Technologie adoptée** — Docker + Kubernetes est validé pour le déploiement. Les manifests permettent un déploiement reproductible et scalable.
