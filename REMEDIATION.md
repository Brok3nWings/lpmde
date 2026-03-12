# Plan de remédiation sécurité — La Petite Maison de l'Épouvante (v1)

---

## 1. Analyse des résultats et métriques collectées

### 1.1 Résultats des tests automatisés

| Métrique | Valeur | Seuil cible | Évaluation |
|----------|--------|-------------|------------|
| Tests passants | 59/59 (186 assertions) | 100 % | ✅ Aucune régression |
| Couverture classes | 78,95 % (15/19) | ≥ 80 % | ⚠️ Légèrement sous le seuil |
| Couverture méthodes | 74,60 % (47/63) | ≥ 75 % | ⚠️ Légèrement sous le seuil |
| Couverture lignes | 59,11 % (146/247) | ≥ 60 % | ⚠️ Chemins d'erreur non couverts |

### 1.2 Résultats des tests de charge (k6 smoke test — 1 VU, 30s)

| Métrique | Valeur | Seuil | Évaluation |
|----------|--------|-------|------------|
| Taux d'erreur | 0,00 % | < 30 % | ✅ |
| p(95) latence globale | < 2000 ms | < 2000 ms | ✅ |
| Checks réussis | 35/35 | — | ✅ |

> ⚠️ Le smoke test (1 VU, 30s) ne révèle pas les problèmes de performance sous charge réelle. Le load test (100 VUs, seuil p95 < 500ms) doit être interprété pour évaluer la tenue en charge.

### 1.3 Analyse du scan Trivy

Le scan Trivy (filesystem + image Docker) est intégré au pipeline. Les résultats sont uploadés dans l'onglet GitHub Security (format SARIF). Les vulnérabilités identifiées sur les dépendances système de l'image `php:8.2-apache` constituent la principale source de CVE.

---

## 2. Vulnérabilités identifiées

### V-01 — Absence de rate limiting sur les endpoints sensibles

**Niveau de risque :** CRITIQUE
**Description :** Les routes `/api/profile/{id}`, `/do-login` et `/test-rabbit` n'ont aucune limitation de débit. Un attaquant peut effectuer des milliers de requêtes par seconde (bruteforce, DoS applicatif, scraping de profils).
**Vecteur OWASP :** API4:2023 — Unrestricted Resource Consumption
**Preuve :** Le test k6 spike (200 VUs simultanés) ne rencontre aucun blocage.

---

### V-02 — Secret `APP_SECRET` potentiellement exposé ou faible

**Niveau de risque :** ÉLEVÉ
**Description :** L'`APP_SECRET` utilisé dans la démo est une valeur fixe (`demo_secret_minimum_32_chars_ok`) passée en clair dans la commande `docker run`. En production, un secret prévisible ou réutilisé compromet la sécurité des sessions Symfony et des tokens CSRF.
**Vecteur OWASP :** A02:2021 — Cryptographic Failures
**Preuve :** Valeur visible dans `DEMO.md` et dans les commandes de démonstration.

---

### V-03 — Credentials Keycloak en clair dans `.env`

**Niveau de risque :** ÉLEVÉ
**Description :** Le `KEYCLOAK_CLIENT_SECRET` et la `DATABASE_URL` sont présents dans le fichier `.env`. Si ce fichier est accidentellement versionné (commit), les secrets sont définitivement exposés dans l'historique Git.
**Vecteur OWASP :** A02:2021 — Cryptographic Failures
**Preuve :** `KEYCLOAK_CLIENT_SECRET=Uc1QgKt5VIjRhqhhe3TpGWCZmUc7oVZk` dans `.env`.

---

### V-04 — Tokens Keycloak non révoqués à la déconnexion

**Niveau de risque :** ÉLEVÉ
**Description :** Le flow de déconnexion Keycloak (end session endpoint) n'est pas implémenté. Après un "logout" côté application Symfony, le JWT Keycloak reste valide jusqu'à son expiration naturelle. Un attaquant ayant intercepté le token peut continuer à l'utiliser.
**Vecteur OWASP :** A07:2021 — Identification and Authentication Failures
**Preuve :** Absence de route `/logout/keycloak` et d'appel à l'end session endpoint dans `SecurityController`.

---

### V-05 — Validation insuffisante des paramètres de l'API BFF

**Niveau de risque :** MOYEN
**Description :** Le paramètre `{id}` de `GET /api/profile/{id}` est utilisé sans contrainte de validation au-delà du cast PHP implicite. Une valeur négative, nulle ou extrêmement grande peut générer des comportements inattendus ou des erreurs non gérées côté services internes.
**Vecteur OWASP :** A03:2021 — Injection (validation côté serveur insuffisante)

---

### V-06 — Logs potentiellement verbeux (données personnelles)

**Niveau de risque :** MOYEN
**Description :** Les handlers Messenger loggent le `username` en clair. Si le username est une adresse email ou un identifiant personnel, cela peut constituer une violation du RGPD (article 5 — minimisation des données).
**Vecteur OWASP :** A09:2021 — Security Logging and Monitoring Failures
**Preuve :** `app.INFO: UserLoginNotification reçue {"username":"BryanDemo","login_time":"…"}`

---

### V-07 — HTTP uniquement en développement local

**Niveau de risque :** FAIBLE (dev uniquement)
**Description :** Le serveur PHP intégré (`php -S localhost:8000`) ne supporte pas HTTPS. Les tokens OAuth2 et les données de formulaire transitent en clair sur le réseau local pendant le développement.
**Vecteur OWASP :** A02:2021 — Cryptographic Failures
**Preuve :** URLs de démo en `http://localhost:8000`.

---

## 3. Plan de remédiation

### Priorité CRITIQUE

#### R-01 — Mettre en place un rate limiting (répond à V-01)

**Approche recommandée :** Double protection Ingress + applicatif.

**Option 1 — Nginx Ingress Kubernetes (infra) :**
```yaml
# k8s/ingress.yaml
annotations:
  nginx.ingress.kubernetes.io/limit-rps: "10"
  nginx.ingress.kubernetes.io/limit-connections: "5"
```

**Option 2 — Symfony RateLimiter (applicatif) :**
```yaml
# config/packages/framework.yaml
rate_limiter:
    api_limiter:
        policy: 'sliding_window'
        limit: 100
        interval: '1 minute'
```

```php
// Dans ApiGatewayController
use Symfony\Component\RateLimiter\RateLimiterFactory;

public function profile(int $id, ApiAggregator $aggregator, RateLimiterFactory $apiLimiter, Request $request): JsonResponse
{
    $limiter = $apiLimiter->create($request->getClientIp());
    if (!$limiter->consume(1)->isAccepted()) {
        return $this->json(['error' => 'Too Many Requests'], 429);
    }
    // ...
}
```

**Délai cible :** Sprint 1 (avant mise en production)

---

### Priorité ÉLEVÉE

#### R-02 — Gestion des secrets via Kubernetes Secrets (répond à V-02 et V-03)

**Action :** Supprimer les secrets du `.env` versionné et les injecter via Kubernetes Secrets.

```yaml
# k8s/secrets.yaml (ne jamais commiter — générer via CI/CD ou Vault)
apiVersion: v1
kind: Secret
metadata:
  name: lpmde-secrets
type: Opaque
stringData:
  APP_SECRET: "valeur-aleatoire-256bits"
  KEYCLOAK_CLIENT_SECRET: "valeur-keycloak"
  DATABASE_URL: "postgresql://user:pass@postgres:5432/lpmde"
```

**Également :**
- Ajouter `.env.local` et tout fichier contenant de vraies valeurs au `.gitignore`
- Utiliser `.env` uniquement comme template (valeurs fictives)
- Pour les environnements cloud : utiliser HashiCorp Vault ou AWS Secrets Manager

**Délai cible :** Sprint 1 (avant mise en production)

---

#### R-03 — Implémenter la déconnexion Keycloak (répond à V-04)

**Action :** Ajouter une route de logout qui appelle l'end session endpoint de Keycloak.

```php
// src/Service/KeycloakService.php
public function getLogoutUrl(string $postLogoutRedirectUri): string
{
    return sprintf(
        '%s/realms/%s/protocol/openid-connect/logout?post_logout_redirect_uri=%s&client_id=%s',
        $this->keycloakUrl,
        $this->realm,
        urlencode($postLogoutRedirectUri),
        $this->clientId
    );
}
```

```php
// src/Controller/SecurityController.php
#[Route('/logout/keycloak', name: 'app_logout_keycloak')]
public function logoutKeycloak(KeycloakService $keycloakService, Request $request): Response
{
    $request->getSession()->invalidate();
    $logoutUrl = $keycloakService->getLogoutUrl('http://localhost:8000/');
    return $this->redirect($logoutUrl);
}
```

**Délai cible :** Sprint 2

---

### Priorité MOYENNE

#### R-04 — Validation des paramètres API (répond à V-05)

**Action :** Ajouter des contraintes Symfony Validator sur les paramètres de route.

```php
// src/Controller/ApiGatewayController.php
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

#[Route('/api/profile/{id}', methods: ['GET'])]
public function profile(int $id, ApiAggregator $aggregator): JsonResponse
{
    if ($id <= 0 || $id > 2147483647) {
        throw new BadRequestHttpException('Invalid user ID');
    }
    $data = $aggregator->getUserProfile($id);
    return $this->json($data, !empty($data['errors']) ? 206 : 200);
}
```

**Délai cible :** Sprint 2

---

#### R-05 — Anonymisation des logs (répond à V-06)

**Action :** Remplacer les données personnelles dans les logs par des identifiants techniques.

```php
// Avant
$this->logger->info('UserLoginNotification reçue', [
    'username' => $message->getUsername(),
]);

// Après — hash non réversible
$this->logger->info('UserLoginNotification reçue', [
    'user_hash' => substr(hash('sha256', $message->getUsername()), 0, 12),
    'login_time' => $message->getLoginTime(),
]);
```

**Délai cible :** Sprint 2

---

### Priorité FAIBLE

#### R-06 — HTTPS en développement local (répond à V-07)

**Action :** Utiliser Symfony CLI qui supporte HTTPS natif avec certificat auto-signé.

```powershell
# Remplacer php -S localhost:8000 par :
symfony server:start --port=8000
# → HTTPS automatique sur https://127.0.0.1:8000
```

**Délai cible :** Sprint 3 (amélioration développeur experience)

---

## 4. Tableau de synthèse

| ID | Vulnérabilité | Risque | OWASP | Remédiation | Délai |
|----|---------------|--------|-------|-------------|-------|
| V-01 | Absence rate limiting | CRITIQUE | API4:2023 | Rate limiter Nginx/Symfony | Sprint 1 |
| V-02 | APP_SECRET faible/exposé | ÉLEVÉ | A02:2021 | Kubernetes Secrets | Sprint 1 |
| V-03 | Credentials en `.env` | ÉLEVÉ | A02:2021 | Kubernetes Secrets + .gitignore | Sprint 1 |
| V-04 | Tokens non révoqués | ÉLEVÉ | A07:2021 | End session Keycloak | Sprint 2 |
| V-05 | Validation paramètres | MOYEN | A03:2021 | Assert positif sur `{id}` | Sprint 2 |
| V-06 | Logs verbeux (RGPD) | MOYEN | A09:2021 | Anonymisation (`user_hash`) | Sprint 2 |
| V-07 | HTTP en dev local | FAIBLE | A02:2021 | Symfony CLI HTTPS natif | Sprint 3 |

---

## 5. Mesures préventives pour la v2

1. **Web Application Firewall (WAF)** — Intégrer ModSecurity ou Cloudflare WAF devant l'Ingress pour filtrer les attaques automatisées (SQLi, XSS, bots malveillants).

2. **Rotation automatique des secrets** — Intégrer HashiCorp Vault ou Kubernetes External Secrets Operator pour la rotation périodique des credentials sans redéploiement manuel.

3. **Scanning des dépendances en continu** — Configurer Dependabot sur GitHub pour les mises à jour automatiques de sécurité Composer et npm.

4. **Conformité RGPD** — Documenter les données personnelles collectées (email, username, keycloakId), mettre en place les droits d'accès/rectification/suppression, et nommer un DPO.

5. **mTLS intra-cluster** — Mettre en place Istio Service Mesh pour chiffrer le trafic entre les services internes Kubernetes (actuellement en HTTP non chiffré sur le réseau interne).

6. **Journalisation centralisée** — Intégrer un stack ELK (Elasticsearch + Logstash + Kibana) ou Grafana Loki pour centraliser et indexer les logs structurés JSON de Monolog, avec alertes automatiques sur les patterns d'erreur.
