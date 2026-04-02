const http = require('http');
const assert = require('assert');
const { MongoClient } = require('mongodb');

const apiCall = (method, path, body, token = null) => new Promise((resolve, reject) => {
  const data = body ? JSON.stringify(body) : '';
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const req = http.request({
    hostname: '127.0.0.1',
    port: 5000,
    path,
    method,
    headers,
  }, (res) => {
    let resp = '';
    res.on('data', (c) => (resp += c));
    res.on('end', () => {
      try {
        resolve({ status: res.statusCode, data: JSON.parse(resp) });
      } catch (e) {
        resolve({ status: res.statusCode, raw: resp });
      }
    });
  });
  req.on('error', reject);
  if (data) req.write(data);
  req.end();
});

const seedWeatherDisruption = async (userId) => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Missing MONGO_URI environment variable');
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('gigshield_db');
    const weathers = db.collection('weathers');
    
    const ObjectId = require('mongodb').ObjectId;
    const result = await weathers.insertOne({
      userId: new ObjectId(userId),
      rainfall: 120,
      temperature: 45,
      eventType: 'HEAT',
      createdAt: new Date(),
    });
    
    return result;
  } finally {
    await client.close();
  }
};

(async () => {
  try {
    console.log('=== E2E Test: ML Payout Integration ===\n');

    // 1. Register user
    console.log('[1] Registering user...');
    const reg = await apiCall('POST', '/api/auth/register', {
      name: 'Test Worker',
      email: 'worker' + Date.now() + '@test.com',
      password: 'password123',
      location: 'Hyderabad',
      platform: 'uber',
    });
    assert.strictEqual(reg.status, 201, 'Register failed');
    
    const userObj = reg.data.data.user;
    const userId = userObj._id;
    const token = reg.data.data.token;
    console.log('✓ Registered. userId:', userId);

    // 2. Seed weather disruption directly to MongoDB
    console.log('\n[2] Seeding weather disruption in MongoDB...');
    await seedWeatherDisruption(userId);
    console.log('✓ Created HEAT disruption (rainfall:120, temp:45)');

    // 3. Trigger payout
    console.log('\n[3] Triggering payout (calling ML API)...');
    const payout = await apiCall('POST', '/api/payouts/trigger', null, token);
    console.log('  Status:', payout.status);
    
    const results = payout.data.data || payout.data;
    console.log('  Full Response:', JSON.stringify(results, null, 2));

    // Verify response
    if (payout.status === 201 || payout.status === 200) {
      assert(typeof results.payout === 'boolean', 'payout must be boolean');
      assert(typeof results.amount === 'number', 'amount must be number');
      assert(results.riskLevel, 'riskLevel must exist');
      
      console.log('\n✅ E2E TEST PASSED');
      console.log('   Payout triggered:', results.payout);
      console.log('   Amount:', results.amount);
      console.log('   Risk Level:', results.riskLevel);
      console.log('\n   The ML API integration is working!');
      process.exit(0);
    } else {
      throw new Error('Payout returned status ' + payout.status + ': ' + JSON.stringify(results));
    }
  } catch (error) {
    console.error('\n❌ E2E TEST FAILED');
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
