/**
 * Test de pic (spike test) — simulation d'un pic soudain de trafic
 *
 * Usage : k6 run load-tests/spike-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('error_rate');

export const options = {
    stages: [
        { duration: '10s', target: 5   },   // warmup
        { duration: '10s', target: 200 },   // pic soudain
        { duration: '20s', target: 200 },   // maintien du pic
        { duration: '10s', target: 5   },   // retour à la normale
        { duration: '10s', target: 0   },
    ],
    thresholds: {
        http_req_failed:   ['rate<0.10'],   // seuil assoupli pendant le pic
        http_req_duration: ['p(95)<2000'],
        error_rate:        ['rate<0.10'],
    },
};

const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:8000';

export default function () {
    const userId = Math.floor(Math.random() * 10) + 1;

    const res = http.get(`${BASE_URL}/api/profile/${userId}`);
    const ok  = check(res, {
        'status < 500': (r) => r.status < 500,
    });
    errorRate.add(!ok);
    sleep(0.2);
}
