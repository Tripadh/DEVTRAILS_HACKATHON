const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error('Missing MONGO_URI environment variable');
}
const client = new MongoClient(uri);

const seedWeather = async (userId) => {
  try {
    await client.connect();
    const db = client.db('gigshield_db');
    const weathers = db.collection('weathers');
    
    const result = await weathers.insertOne({
      userId: require('mongodb').ObjectId.createFromHexString(userId),
      rainfall: 120,
      humidity: 92,
      temperature: 45,
      windSpeed: 34,
      eventType: 'FLOOD',
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
