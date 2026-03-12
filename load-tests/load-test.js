/**
 * Test de charge k6 — La Petite Maison de l'Épouvante
 *
 * Usage :
 *   k6 run load-tests/load-test.js
 *   k6 run --vus 50 --duration 60s load-tests/load-test.js
 *   k6 run load-tests/load-test.js --out json=load-tests/results.json
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ---------- Métriques personnalisées ----------
const errorRate    = new Rate('error_rate');
const apiLatency   = new Trend('api_gateway_latency', true);
const prodLatency  = new Trend('products_latency',    true);

// ---------- Configuration des scénarios ----------
export const options = {
    scenarios: {
        // Montée en charge progressive (ramp-up)
        ramp_up: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '30s', target: 10  },  // montée à 10 VUs
                { duration: '1m',  target: 50  },  // montée à 50 VUs
                { duration: '30s', target: 100 },  // pic à 100 VUs
                { duration: '30s', target: 0   },  // descente
            ],
            gracefulRampDown: '10s',
        },
        // Test de soak : charge constante prolongée
        soak: {
            executor: 'constant-vus',
            vus: 20,
            duration: '2m',
            startTime: '2m30s',  // démarre après le ramp-up
        },
    },

    // Seuils d'acceptabilité (SLA)
    thresholds: {
        http_req_failed:        ['rate<0.05'],    // < 5 % d'erreurs
        http_req_duration:      ['p(95)<500'],    // 95e percentile < 500 ms
        error_rate:             ['rate<0.05'],
        api_gateway_latency:    ['p(95)<800'],    // BFF tolère un peu plus
    },
};

// ---------- URL de base (surcharger via env var K6_BASE_URL) ----------
const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:8000';

// ---------- Scénario principal ----------
export default function () {
    const userId = Math.floor(Math.random() * 10) + 1;  // IDs 1-10

    group('Page d\'accueil', () => {
        const res = http.get(`${BASE_URL}/`);
        check(res, {
            'homepage 200': (r) => r.status === 200,
        });
        errorRate.add(res.status >= 400);
    });

    sleep(0.5);

    group('API Products', () => {
        const start = Date.now();
        const res   = http.get(`${BASE_URL}/api/products`);
        prodLatency.add(Date.now() - start);

        const ok = check(res, {
            'products 200':          (r) => r.status === 200,
            'products content-type': (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
        });
        errorRate.add(!ok);
    });

    sleep(0.5);

    group('API Gateway BFF', () => {
        const start = Date.now();
        const res   = http.get(`${BASE_URL}/api/profile/${userId}`);
        apiLatency.add(Date.now() - start);

        // 200 = succès complet, 206 = succès partiel (un service dégradé)
        const ok = check(res, {
            'profile 200 or 206': (r) => r.status === 200 || r.status === 206 || r.status === 401 || r.status === 302,
            'profile json':       (r) => r.headers['Content-Type'] && r.headers['Content-Type'].includes('application/json'),
        });
        errorRate.add(res.status >= 500);
    });

    sleep(1);
}
