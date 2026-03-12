# Backlog & Architecture Technique — La Petite Maison de l'Épouvante

---

## 1. Exigences fonctionnelles reformulées

| ID | Exigence | Priorité |
|----|----------|----------|
| EF-01 | Consultation du profil agrégé (infos compte + statut abonnement) en un seul appel API | Haute |
| EF-02 | Authentification via Keycloak (SSO OAuth2/OIDC) | Haute |
| EF-03 | Notification asynchrone à chaque connexion utilisateur | Moyenne |
| EF-04 | Catalogue de produits consultable via API | Haute |
| EF-05 | Alertes internes (GhostAlert) émises et traitées en masse | Basse |

---

## 2. Backlog — User Stories & Critères d'acceptation

### US-01 — Consultation du profil utilisateur agrégé (fonctionnalité principale implémentée)

> **En tant qu'** utilisateur authentifié,
> **Je veux** consulter mon profil complet (informations personnelles + statut d'abonnement au fanzine)
> **Afin de** disposer d'une vue unifiée sans naviguer entre plusieurs services.

**Critères d'acceptation :**

| # | Critère | Test associé |
|---|---------|-------------|
| CA-01 | `GET /api/profile/{id}` retourne un JSON avec `user`, `subscription` et `errors` | `ApiAggregatorTest::testGetUserProfileSuccess` |
| CA-02 | Si les deux services répondent, statut HTTP = 200 | `ApiAggregatorTest::testGetUserProfileSuccess` |
| CA-03 | Si un service est indisponible, statut HTTP = 206 et `errors` contient le détail | `ApiAggregatorTest::testGetUserProfileWithServiceFailure` |
| CA-04 | Une deuxième requête identique est servie depuis le cache (TTL 60s) | `ApiAggregatorTest::testCacheIsUsedOnSecondCall` |
| CA-05 | Chaque appel génère une trace dans les logs avec contexte `user_id` | Vérification `var/log/dev.log` |

---

### US-02 — Authentification via Keycloak

> **En tant qu'** utilisateur,
> **Je veux** me connecter avec mon compte Keycloak (SSO)
> **Afin de** ne pas avoir à gérer un mot de passe spécifique à l'application.

**Critères d'acceptation :**

| # | Critère | Test associé |
|---|---------|-------------|
| CA-06 | `GET /login/keycloak/redirect` redirige vers l'URL Keycloak avec un `state` CSRF | Vérification de la redirection |
| CA-07 | Le callback valide le `state` et échange le `code` contre un access token | `KeycloakServiceTest` |
| CA-08 | L'utilisateur est créé ou mis à jour en BDD à partir des claims JWT | Inspection entité `User` (champ `keycloakId`) |
| CA-09 | Après connexion, un message `UserLoginNotification` est dispatché sur le bus | Log `messenger.INFO: Sending message` |
| CA-10 | Les routes `/api/*` retournent 401 sans token valide (en production) | `SecurityTest` E2E |

---

### US-03 — Catalogue de produits

> **En tant qu'** internaute,
> **Je veux** consulter le catalogue de produits disponibles
> **Afin de** découvrir l'offre de La Petite Maison de l'Épouvante.

**Critères d'acceptation :**

| # | Critère | Test associé |
|---|---------|-------------|
| CA-11 | `GET /api/products` retourne la liste des produits en JSON | `ProductControllerTest` |
| CA-12 | Le catalogue est accessible sans authentification | Test E2E — réponse 200 sans Authorization header |

---

### US-04 — Notification asynchrone de connexion

> **En tant que** système,
> **Je veux** tracer chaque connexion de façon asynchrone
> **Afin de** ne pas impacter le temps de réponse et garantir la traçabilité.

**Critères d'acceptation :**

| # | Critère | Test associé |
|---|---------|-------------|
| CA-13 | `POST /do-login` dispatche un message `UserLoginNotification` | `UserLoginNotificationHandlerTest` |
| CA-14 | Le handler loggue `username` et `login_time` | `UserLoginNotificationHandlerTest::testHandlerLogsInfo` |
| CA-15 | En mode `sync://`, le message est traité dans la même requête HTTP | Vérification log immédiat après `POST /do-login` |

---

## 3. Schéma d'architecture technique

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Navigateur)                          │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ HTTPS — TLS terminé sur Ingress K8s
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│         Kubernetes Ingress NGINX + cert-manager (TLS auto)          │
└────────┬──────────────────────────────────┬────────────────────────┘
         │                                  │
         ▼                                  ▼
┌──────────────────────┐       ┌────────────────────────────────────┐
│  SecurityController  │       │      API Gateway / BFF             │
│  OAuth2 + Keycloak   │       │      ApiGatewayController          │
│  /login/keycloak/*   │       │      GET /api/profile/{id}         │
└────────┬─────────────┘       └──────┬─────────────┬──────────────┘
         │                            │             │
         │ Authorization Code Flow    │ HTTP        │ HTTP + Cache (60s TTL)
         ▼                            ▼             ▼
┌────────────────────┐  ┌──────────────────┐  ┌─────────────────────┐
│    Keycloak        │  │   UserService    │  │  SubscriptionService│
│  OAuth2 / OIDC     │  │  /internal/users │  │  /internal/sub…     │
│  port 8080         │  └──────────────────┘  └─────────────────────┘
└────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                Application Symfony 6.4 / PHP 8.2                    │
│                                                                     │
│  ProductController    LoginController    HomeController             │
│  /api/products        /do-login          /                          │
│                       /test-rabbit                                  │
│                              │ dispatch()                           │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 Symfony Messenger (Bus)                      │  │
│  │   UserLoginNotificationHandler    GhostAlertHandler          │  │
│  └──────────────────────┬───────────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────────────┘
                          │
         ┌────────────────┼──────────────────┐
         ▼                ▼                   ▼
┌─────────────┐  ┌─────────────────┐  ┌──────────────────┐
│  PostgreSQL │  │  RabbitMQ       │  │  Monolog         │
│  Doctrine   │  │  AMQP / sync://  │  │  Logs JSON       │
│  ORM        │  │  (en dev)       │  │  structurés      │
└─────────────┘  └─────────────────┘  └──────────────────┘

Couche CI/CD & Qualité :
GitHub Actions → SonarCloud → Trivy → Docker Hub → K8s Deploy
```

### Choix techniques justifiés

| Composant | Technologie | Justification |
|-----------|------------|---------------|
| Framework | Symfony 6.4 / PHP 8.2 | LTS, Messenger intégré, ORM Doctrine, éco-système mature |
| Authentification | Keycloak 20+ (OAuth2/OIDC) | Standard ouvert, SSO, gestion des rôles, federation d'identité |
| Messagerie | Symfony Messenger + RabbitMQ | Découplage, résilience, backpressure, mode sync en dev |
| Base de données | PostgreSQL | ACID, performances, compatible Kubernetes StatefulSet |
| Cache | Symfony Cache (filesystem) | Réduction latence BFF, TTL configurable par entrée |
| Orchestration | Kubernetes | Scalabilité horizontale, rolling updates, health checks |
| Observabilité | Monolog + SonarCloud + Trivy | Logs structurés JSON, qualité code, scan vulnérabilités |
| Tests de charge | k6 | Léger, scriptable JS, métriques p95/VUs précises |
| CI/CD | GitHub Actions | Natif GitHub, jobs parallèles, artefacts, SARIF upload |

### Protocoles de communication

| Lien | Protocole | Sécurité |
|------|-----------|----------|
| Client → Ingress | HTTPS | TLS 1.3 via cert-manager (Let's Encrypt) |
| BFF → Services internes | HTTP | Réseau interne Kubernetes (non exposé) |
| App → Keycloak | HTTPS | Authorization Code Flow + state CSRF |
| App → RabbitMQ | AMQP | Credentials + réseau interne K8s |
| App → PostgreSQL | TCP | Credentials via Kubernetes Secret |
