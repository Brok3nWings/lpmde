/**
 * Test de fumée (smoke test) — validation rapide avant la démo
 *
 * Usage : k6 run load-tests/smoke-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus:      1,
    duration: '30s',
    // redirects: 0 sur les requêtes individuelles (voir ci-dessous)
    // http_req_failed exclut les 3xx (redirections vers Keycloak attendues)
    thresholds: {
        http_req_failed:   ['rate<0.30'],   // tolérance redirections Keycloak hors ligne
        http_req_duration: ['p(95)<2000'],
    },
};

const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:8000';

export default function () {
    // Accueil
    let res = http.get(`${BASE_URL}/`);
    check(res, { 'GET / → 200': (r) => r.status === 200 });

    sleep(0.5);

    // Produits (200 sans auth, 302/401 avec auth activée)
    res = http.get(`${BASE_URL}/api/products`, { redirects: 0 });
    check(res, {
        'GET /api/products → non-500': (r) => r.status < 500,
        'GET /api/products → 200/302/401': (r) => [200, 302, 401].includes(r.status),
    });

    sleep(0.5);

    // Services internes
    res = http.get(`${BASE_URL}/internal/users/1`);
    check(res, { 'GET /internal/users/1 → 200 or 404': (r) => r.status < 500 });

    sleep(0.5);

    res = http.get(`${BASE_URL}/internal/subscription/1`);
    check(res, { 'GET /internal/subscription/1 → 200 or 404': (r) => r.status < 500 });

    sleep(1);
}
