# Processus Qualité & DevSecOps — La Petite Maison de l'Épouvante

---

## 1. Indicateurs / Métriques qualité (ISO 25010)

La norme ISO 25010 définit 8 caractéristiques qualité. Quatre indicateurs ont été retenus et intégrés au pipeline CI/CD.

---

### Indicateur 1 — Couverture de code (Fiabilité / Maturité)

**Caractéristique ISO 25010 :** Fiabilité > Maturité

**Définition :** Pourcentage de lignes, méthodes et classes couvertes par des tests automatisés.

**Valeurs cibles :**
- Classes : ≥ 80 %
- Méthodes : ≥ 75 %
- Lignes : ≥ 60 %

**Outil de mesure :** PHPUnit 11 + Xdebug 3 → rapport Cobertura XML → SonarCloud

**Valeurs actuelles du prototype :**
- Classes : 78,95 % (15/19)
- Méthodes : 74,60 % (47/63)
- Lignes : 59,11 % (146/247)

**Lien avec la dette technique :** Une couverture insuffisante permet aux régressions de s'introduire sans être détectées. SonarCloud bloque la PR si le seuil baisse (Quality Gate). Ce mécanisme empêche que la dette s'accumule silencieusement à chaque sprint.

---

### Indicateur 2 — Taux d'erreur sous charge (Efficacité de performance)

**Caractéristique ISO 25010 :** Efficacité de performance > Comportement temporel

**Définition :** Pourcentage de requêtes HTTP retournant une erreur (5xx) et latence au percentile 95 lors d'un test de charge.

**Seuils configurés (k6) :**
- Taux d'erreur global < 5 %
- p(95) latence globale < 500 ms
- p(95) latence BFF `/api/profile` < 800 ms

**Outil de mesure :** k6 (`load-tests/load-test.js`) — intégré au pipeline CI/CD (job `k6-smoke-test`)

**Lien avec la dette technique :** Si les p95 se dégradent sprint après sprint (requêtes N+1, absence de cache, fuites mémoire), c'est un signal précoce de dette technique. Les seuils k6 en CI bloquent la livraison avant que la dégradation n'atteigne la production.

---

### Indicateur 3 — Nombre de vulnérabilités CRITICAL/HIGH (Sécurité)

**Caractéristique ISO 25010 :** Sécurité > Confidentialité et intégrité

**Définition :** Nombre de vulnérabilités CRITICAL ou HIGH détectées par Trivy dans l'image Docker et le système de fichiers.

**Seuil cible :** 0 vulnérabilité CRITICAL non corrigée en production

**Outil de mesure :** Trivy (scan filesystem + image Docker) → SARIF uploadé dans GitHub Security Tab

**Lien avec la dette technique :** Les dépendances non mises à jour accumulent des CVE avec le temps. En scannant à chaque build, l'équipe est alertée dès l'introduction d'une dépendance vulnérable, avant qu'elle ne se propage dans l'image de production.

---

### Indicateur 4 — Indice de maintenabilité SonarCloud (Maintenabilité)

**Caractéristique ISO 25010 :** Maintenabilité > Modifiabilité

**Définition :** Note SonarCloud (A à E) basée sur les code smells, les duplications de code et la complexité cyclomatique.

**Seuil cible :** Rating A (≤ 5 % code dupliqué, ≤ 10 nouveaux code smells par sprint)

**Outil de mesure :** SonarCloud (analyse statique PHP) — intégré au pipeline GitHub Actions (job `sonar-audit`)

**Lien avec la dette technique :** SonarCloud calcule explicitement la dette technique en heures de correction. En exposant cette métrique dans chaque PR, chaque développeur voit l'impact de son code sur la maintenabilité globale et est encouragé à refactoriser tôt plutôt que tard.

---

## 2. Cycle de vie DevSecOps

```
PLAN ──► CODE ──► BUILD ──► TEST ──► RELEASE ──► DEPLOY ──► OPERATE ──► MONITOR
  │         │       │         │        │            │           │           │
  ▼         ▼       ▼         ▼        ▼            ▼           ▼           ▼
Threat    SAST    Scan      Tests    Docker       K8s          HTTPS      Logs
Modeling  (Sonar) dépend.   auto.    Image Build  Staging/     TLS        structurés
User      Secrets (npm      (unit,   + Tagging    Prod         Keycloak   (Monolog)
Stories   gitignore audit,  E2E,     Docker Hub   Rolling      JWT        Métriques
Backlog   revue   Trivy)    k6)      Trivy scan   Update       Auth       k6 continu
```

### Détail par étape avec mesures de sécurité

| Étape | Activités | Mesures de sécurité |
|-------|-----------|---------------------|
| **PLAN** | User Stories, critères d'acceptation, analyse des menaces | Threat modeling (STRIDE), identification des données sensibles, revue RGPD |
| **CODE** | Développement PHP/Symfony, revue de code (PR) | `.gitignore` sur `.env`, pas de secrets en clair, validation des entrées, protection CSRF (state OAuth2) |
| **BUILD** | `composer install --no-dev`, Dockerfile | Dépendances minimales (--no-dev), utilisateur non-root dans le conteneur, OPcache activé |
| **TEST** | PHPUnit (unit + E2E), k6 (charge), Trivy (filesystem), npm audit, SonarCloud | SAST SonarCloud, scan CVE Trivy filesystem, audit npm dépendances JS |
| **RELEASE** | Build image Docker, push Docker Hub, tag sémantique | Trivy scan image finale, SARIF uploadé GitHub Security Tab |
| **DEPLOY** | GitHub Actions → K8s Staging → K8s Production (manuel) | Kubernetes Secrets pour credentials, RBAC K8s, Ingress HTTPS + cert-manager |
| **OPERATE** | Application en production, K8s health checks (liveness/readiness) | HTTPS/TLS 1.3, Keycloak JWT, ROLE_USER sur /api/*, rate limiting (v2) |
| **MONITOR** | Monolog logs structurés JSON, SonarCloud reporting | Logs sans données personnelles sensibles, alertes 5xx, audit trail connexions |

---

## 3. Schéma du pipeline CI/CD GitHub Actions

```
git push (branches: main, master, develop, bryan)
        │
        ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Stage INSTALL                                                       │
│  composer install → artifact: vendor/                               │
└────────────────────┬─────────────────────────────────────────────────┘
                     │
        ┌────────────┼──────────────┬─────────────────┐
        ▼            ▼              ▼                  ▼
┌─────────────┐ ┌──────────┐ ┌──────────────┐ ┌─────────────────────┐
│ sast-npm-   │ │sonar-    │ │trivy-fs-     │ │unit-test + e2e-test │
│ audit       │ │audit     │ │audit         │ │PHPUnit + coverage   │
│ npm audit   │ │SonarCloud│ │Trivy FS scan │ │Cobertura + JUnit    │
└─────────────┘ └──────────┘ └──────────────┘ └──────────┬──────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  k6-smoke-test  │
                                                 │  1 VU / 30s     │
                                                 │  vérif. routes  │
                                                 └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │  build-image    │
                                                 │  Docker build   │
                                                 │  + push Hub     │
                                                 └────────┬────────┘
                                                          │
                                                          ▼
                                                 ┌─────────────────┐
                                                 │trivy-image-scan │
                                                 │ Scan image PROD │
                                                 │ SARIF → GitHub  │
                                                 └────────┬────────┘
                                                          │
                                             ┌────────────┴───────────┐
                                             ▼                        ▼
                                    ┌──────────────┐       ┌──────────────────┐
                                    │deploy-staging│       │deploy-production │
                                    │K8s Staging   │       │K8s Production    │
                                    │(auto)        │       │(manuel, main only)│
                                    └──────────────┘       └──────────────────┘
```

**Correspondance indicateurs / jobs CI :**

| Indicateur | Job CI | Artefact |
|-----------|--------|---------|
| Couverture de code | `unit-test` | `var/log/cobertura.xml`, `var/log/junit.xml` |
| Taux d'erreur sous charge | `k6-smoke-test` | `var/log/k6-results.json` |
| Vulnérabilités CRITICAL | `trivy-fs-audit` + `trivy-image-scan` | SARIF → GitHub Security |
| Maintenabilité | `sonar-audit` | SonarCloud dashboard |

---

## 4. Compétences et plan de formation

### Cartographie des compétences nécessaires

| Domaine | Compétences requises | Niveau attendu |
|---------|---------------------|----------------|
| **Développement** | PHP 8.2, Symfony 6.4, API REST, ORM Doctrine | Expert (Lead Dev) / Intermédiaire (Dev) |
| **Architecture** | Microservices, BFF Pattern, API Gateway, Event-Driven | Expert (Lead Dev) |
| **DevOps** | Docker, Kubernetes, Helm, CI/CD (GitHub Actions) | Intermédiaire |
| **Sécurité** | OAuth2/OIDC, Keycloak, OWASP Top 10, TLS/HTTPS | Intermédiaire |
| **Qualité** | PHPUnit, TDD, SonarCloud, couverture de code | Intermédiaire |
| **Observabilité** | Monolog, logs structurés, dashboards (Grafana) | Débutant → Intermédiaire |
| **Tests de charge** | k6, analyse de métriques p95/p99 | Débutant |
| **Base de données** | PostgreSQL, migrations Doctrine, optimisation requêtes | Intermédiaire |

### Composition de l'équipe recommandée

| Rôle | Nb | Profil |
|------|----|--------|
| Lead Developer / Architecte | 1 | 5+ ans, maîtrise Symfony + K8s + DevSecOps |
| Développeur Backend | 2 | 3-5 ans, Symfony, API REST, tests unitaires |
| DevOps Engineer | 1 | Docker, Kubernetes, CI/CD, sécurité infra |
| QA / Test Engineer | 1 | PHPUnit, k6, automatisation, acceptance tests |

### Action de formation proposée : DevSecOps & Observabilité

**Objectif :** Renforcer les compétences des développeurs juniors sur l'intégration de la sécurité et de l'observabilité dans leur workflow quotidien.

| Module | Contenu | Durée | Format |
|--------|---------|-------|--------|
| OWASP Top 10 appliqué à Symfony | Injection, XSS, CSRF, broken auth — démonstrations sur le code du projet | 1 jour | Atelier pratique |
| Keycloak avancé | OAuth2 flows, scopes, PKCE, audit des tokens JWT | 0,5 jour | Hands-on |
| Observabilité : logs + métriques | Monolog JSON, corrélation event-log, introduction Prometheus/Grafana | 1 jour | Atelier pratique |
| k6 & analyse de performance | Scénarios de charge, lecture des résultats p95/p99, identification des bottlenecks | 0,5 jour | Hands-on |

**Format :** Formation interne animée par le Lead Developer + session externe OWASP (1 journée).
**Fréquence :** Annuelle + sessions flash de 30 min à chaque introduction d'une nouvelle technologie majeure.
