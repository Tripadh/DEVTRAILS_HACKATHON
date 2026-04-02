const http = require('http');
const assert = require('assert');
const mongoose = require('mongoose');

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
    assert.strictEqual(reg.status, 201, 'Register failed: ' + JSON.stringify(reg.data));
    const token = reg.data.data.token;
    const userId = reg.data.data.user._id;
    console.log('✓ Registered. userId:', userId);

    // 2. Connect to MongoDB and seed a weather disruption
    console.log('\n[2] Seeding weather disruption in MongoDB...');
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('Missing MONGO_URI environment variable');
    }
    await mongoose.connect(mongoUri);
    
    const weatherSchema = new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      rainfall: Number,
      temperature: Number,
      eventType: String,
      createdAt: { type: Date, default: Date.now },
    });
    const Weather = mongoose.model('Weather', weatherSchema);
    
    const weatherDoc = await Weather.create({
      userId: new mongoose.Types.ObjectId(userId),
      rainfall: 120,
      temperature: 45,
      eventType: 'HEAT',
    });
    console.log('✓ Created weather record:', { eventType: weatherDoc.eventType, temp: weatherDoc.temperature });
    
    await mongoose.disconnect();

    // 3. Trigger payout
    console.log('\n[3] Triggering payout (should call ML API)...');
    const payout = await apiCall('POST', '/api/payouts/trigger', null, token);
    console.log('  Status:', payout.status);
    console.log('  Response:', JSON.stringify(payout.data, null, 2));

    if (payout.status === 201 || payout.status === 200) {
      assert(typeof payout.data.payout === 'boolean', 'payout must be boolean');
      assert(typeof payout.data.amount === 'number', 'amount must be number');
      assert(payout.data.riskLevel, 'riskLevel must exist');
      
      console.log('\n✅ E2E TEST PASSED');
      console.log('   Payout triggered:', payout.data.payout);
      console.log('   Amount:', payout.data.amount);
      console.log('   Risk Level:', payout.data.riskLevel);
      process.exit(0);
    } else {
      throw new Error('Payout trigger returned status ' + payout.status);
    }
  } catch (error) {
    console.error('\n❌ E2E TEST FAILED');
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
})();
