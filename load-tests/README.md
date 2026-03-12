# Tests de charge — La Petite Maison de l'Épouvante

## Outil utilisé : k6

[k6](https://k6.io) est un outil de test de charge open-source, léger et cross-platform.  
Les scripts sont écrits en JavaScript (ES6).

---

## Installation

### Windows (Chocolatey — recommandé)
```powershell
choco install k6
```

### Windows (winget)
```powershell
winget install k6 --source winget
```

### Windows (téléchargement direct)
Télécharger le `.msi` depuis https://github.com/grafana/k6/releases et installer.

### Linux / macOS
```bash
brew install k6
```

---

## Prérequis — Démarrer le serveur

Avant de lancer les tests, démarrer les deux serveurs PHP :

```powershell
# Terminal 1 — serveur principal (port 8000)
php -S localhost:8000 -t public

# Terminal 2 — services internes (port 8001)
php -S localhost:8001 -t public
```

---

## Scripts disponibles

| Script | Description | Durée estimée |
|--------|-------------|---------------|
| `smoke-test.js` | Validation rapide — 1 VU, 30 secondes | ~30 s |
| `load-test.js` | Montée en charge + soak test (ramp-up 0→100 VUs) | ~5 min |
| `spike-test.js` | Pic soudain à 200 VUs | ~1 min |

---

## Lancer les tests

### Smoke test (avant démo)
```bash
k6 run load-tests/smoke-test.js
```

### Test de charge complet
```bash
k6 run load-tests/load-test.js
```

### Test de charge avec export JSON
```bash
k6 run load-tests/load-test.js --out json=load-tests/results.json
```

### Test de pic
```bash
k6 run load-tests/spike-test.js
```

### Cibler un autre serveur
```bash
k6 run load-tests/load-test.js -e K6_BASE_URL=http://monserveur.com
```

---

## Seuils d'acceptabilité (SLA)

Définis dans chaque script `options.thresholds` :

| Métrique | Seuil |
|----------|-------|
| Taux d'erreur HTTP | < 5 % |
| p(95) durée requête | < 500 ms |
| p(95) durée BFF `/api/profile` | < 800 ms |

---

## Résultats typiques (serveur local)

Avec un serveur PHP built-in monothread, les performances sont volontairement limitées.  
En production (Docker + PHP-FPM + Nginx), les temps de réponse sont significativement meilleurs.

```
✓ http_req_failed........: 0.00%  ✓ 0    ✗ 0
✓ http_req_duration......: avg=45ms  p(95)=120ms
✓ api_gateway_latency....: avg=89ms  p(95)=210ms
```

---

## Rapport HTML (optionnel)

```bash
k6 run load-tests/load-test.js --out json=load-tests/results.json
# Puis convertir avec k6-reporter ou Grafana
```
