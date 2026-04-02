const http = require('http');
const assert = require('assert');

const apiCall = (method, path, body, token = null) =>
  new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method,
        headers,
      },
      (res) => {
        let resp = '';
        res.on('data', (c) => (resp += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(resp) });
          } catch {
            resolve({ status: res.statusCode, raw: resp });
          }
        });
      },
    );

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });

(async () => {
  try {
    console.log('=== Backend + ML Smoke Test ===');

    const registerRes = await apiCall('POST', '/api/auth/register', {
      name: 'Smoke Worker',
      email: `smoke_${Date.now()}@test.com`,
      password: 'password123',
      location: 'Hyderabad',
      platform: 'worker',
    });

    assert.strictEqual(registerRes.status, 201, `register failed: ${JSON.stringify(registerRes.data)}`);

    const token = registerRes.data?.data?.token;
    const user = registerRes.data?.data?.user || {};
    const userId = user.id || user._id;

    assert(token, 'missing auth token');
    assert(userId, 'missing user id');

    const weatherRes = await apiCall('POST', '/api/dev/seed-weather', {
      location: 'Hyderabad',
      rainfall: 120,
      temperature: 45,
      eventType: 'HEAT',
    }, token);

    assert(
      weatherRes.status === 201,
      `weather check failed: ${JSON.stringify(weatherRes.data || weatherRes.raw)}`,
    );

    const payoutRes = await apiCall('POST', '/api/payouts/trigger', null, token);
    const payload = payoutRes.data?.data || payoutRes.data || {};

    console.log('Payout status:', payoutRes.status);
    console.log('Payout response:', JSON.stringify(payload, null, 2));

    assert(payoutRes.status === 200 || payoutRes.status === 201, 'payout endpoint did not return success');
    assert(typeof payload.payout === 'boolean', 'payout flag missing');
    assert(typeof payload.amount === 'number', 'amount missing');

    console.log('SMOKE_TEST_PASS');
    process.exit(0);
  } catch (error) {
    console.error('SMOKE_TEST_FAIL');
    console.error(error.message || error);
    process.exit(1);
  }
})();
