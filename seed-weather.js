const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://2400032045cse1_db_user:tripadh@cluster0.r3asyvn.mongodb.net/gigshield_db';
const client = new MongoClient(uri);

const seedWeather = async (userId) => {
  try {
    await client.connect();
    const db = client.db('gigshield_db');
    const weathers = db.collection('weathers');
    
    const result = await weathers.insertOne({
      userId: require('mongodb').ObjectId.createFromHexString(userId),
      rainfall: 120,
      temperature: 45,
      eventType: 'HEAT',
      createdAt: new Date(),
    });
    
    console.log('✓ Weather record created:', result.insertedId);
    return result;
  } finally {
    await client.close();
  }
};

module.exports = { seedWeather };

// If run directly
if (require.main === module) {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: node seed-weather.js <userId>');
    process.exit(1);
  }
  seedWeather(userId).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
