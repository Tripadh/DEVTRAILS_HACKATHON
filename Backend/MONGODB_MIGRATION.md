# MongoDB Migration Guide

This document explains the migration from PostgreSQL to MongoDB using Mongoose for the GigShield Backend project.

## 🔄 Migration Summary

### What Changed

**Before (PostgreSQL):**
```
config/db.js    → pg Pool, SQL queries
models/         → Database operations with SQL
services/       → SQL-based logic
```

**After (MongoDB):**
```
config/db.js    → Mongoose connection
models/         → Mongoose Schemas & Models
services/       → Mongoose-based logic
```

## 📦 Dependencies Updated

### Removed
- `pg` - PostgreSQL driver

### Added
- `mongoose` - MongoDB ODM (Object Data Modeling)

### Installation
```bash
npm install
```

## 🗄️ Database Configuration

### Old (.env - PostgreSQL)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gigshield_db
DB_USER=postgres
DB_PASSWORD=password
```

### New (.env - MongoDB)
```
MONGO_URI=mongodb://localhost:27017/gigshield_db
```

**For Cloud MongoDB (Atlas):**
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigshield_db
```

## 🔗 Connection Setup

### PostgreSQL (Old)
```javascript
const pool = new Pool({ host, port, database, user, password });
const query = async (text, params) => await pool.query(text, params);
```

### MongoDB (New)
```javascript
const connectDatabase = async () => {
  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
```

## 📋 Model Structure Changes

### User Model

**PostgreSQL (SQL Table):**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  location VARCHAR(255),
  crop_type VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**MongoDB (Mongoose Schema):**
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  location: { type: String, required: true },
  crop_type: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
```

**Key Differences:**
- `id` → `_id` (automatic ObjectId)
- Validation in schema (not separate)
- `select: false` hides password by default
- `timestamps: true` auto-manages createdAt/updatedAt

### Weather Model

**PostgreSQL:**
- `user_id` (foreign key) → `userId` (ObjectId reference)
- `created_at` → `createdAt` (auto)
- No validation in table definition

**MongoDB:**
```javascript
const weatherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rainfall: { type: Number, min: 0, default: 0 },
  temperature: { type: Number, min: -50, max: 60, default: 0 },
  humidity: { type: Number, min: 0, max: 100, default: 0 },
  description: { type: String, default: 'unknown' },
}, { timestamps: true });
```

**Key Differences:**
- Validation rules in schema (min, max, required)
- Reference to User model via ObjectId
- Auto-indexing on userId and createdAt

### Payout Model

**Similar structure:**
```javascript
const payoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'] },
  riskScore: { type: Number, min: 0, max: 100 },
}, { timestamps: true });
```

## 🔄 Query Method Changes

### User Queries

**PostgreSQL:**
```javascript
const user = await query('SELECT * FROM users WHERE email = $1', [email]);
const user = await query('SELECT * FROM users WHERE id = $1', [userId]);
```

**MongoDB:**
```javascript
const user = await User.findOne({ email });
const user = await User.findById(userId);
const user = await User.findOne({ email }).select('+password'); // Include password
```

### Weather Queries

**PostgreSQL:**
```javascript
const logs = await query(
  'SELECT * FROM weather_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
  [userId, limit]
);
const latest = await query(
  'SELECT * FROM weather_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
  [userId]
);
```

**MongoDB:**
```javascript
const logs = await Weather.find({ userId })
  .sort({ createdAt: -1 })
  .limit(limit);

const latest = await Weather.findOne({ userId })
  .sort({ createdAt: -1 });
```

### Payout Queries

**PostgreSQL:**
```javascript
const payouts = await query(
  'SELECT * FROM payouts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
  [userId, limit]
);

const updated = await query(
  'UPDATE payouts SET status = $1 WHERE id = $2 RETURNING *',
  [status, payoutId]
);

const total = await query(
  'SELECT SUM(amount) as total_amount FROM payouts WHERE user_id = $1 AND status = "paid"',
  [userId]
);
```

**MongoDB:**
```javascript
const payouts = await Payout.find({ userId })
  .sort({ createdAt: -1 })
  .limit(limit);

const updated = await Payout.findByIdAndUpdate(payoutId, { status }, { new: true });

const result = await Payout.aggregate([
  { $match: { userId: ObjectId(userId), status: 'paid' } },
  { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
]);
```

## 📝 Query Method Cheat Sheet

| Operation | PostgreSQL | MongoDB |
|-----------|-----------|---------|
| Create | `query(INSERT...)` | `Model.create()` |
| Read One | `query(SELECT...)` | `Model.findOne()` or `findById()` |
| Read Many | `query(SELECT...)` | `Model.find().sort().limit()` |
| Update | `query(UPDATE...)` | `Model.findByIdAndUpdate()` |
| Delete | `query(DELETE...)` | `Model.findByIdAndDelete()` |
| Aggregate | `query(SELECT SUM...)` | `Model.aggregate()` |
| Count | `query(SELECT COUNT...)` | `Model.countDocuments()` |

## 🔑 Key Differences in Practice

### 1. ObjectId vs UUID/Serial

**PostgreSQL:**
```javascript
user.id === 1  // Number
```

**MongoDB:**
```javascript
user._id === ObjectId("507f1f77bcf86cd799439011")  // ObjectId
// Can convert to string: user._id.toString()
```

### 2. Validation

**PostgreSQL:**
```javascript
// Validation in middleware/services
if (!email.includes('@')) throw error;
```

**MongoDB:**
```javascript
// Validation in schema
email: { type: String, match: /@/ }
```

### 3. Relationships

**PostgreSQL:**
```sql
FOREIGN KEY (user_id) REFERENCES users(id)
```

**MongoDB:**
```javascript
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
// Populate: await Weather.findOne().populate('userId')
```

### 4. Transactions

**PostgreSQL:**
- Native support for transactions

**MongoDB:**
- Available in v4.0+ with single server, v4.2+ with replica set
- Simpler use case: usually not needed

## 🚀 Running the Application

### Prerequisites
```bash
# MongoDB must be running
# Local: mongod command
# Cloud: MongoDB Atlas account
```

### Step 1: Update .env
```
MONGO_URI=mongodb://localhost:27017/gigshield_db
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Start Server
```bash
npm run dev
```

### Expected Output
```
MongoDB connected successfully
Connected to: mongodb://localhost:27017/gigshield_db
GigShield Backend Server Started
Database: MongoDB Ready
```

## 🧪 Testing APIs

All API endpoints remain the same:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test@123","location":"Delhi","crop_type":"rice"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123"}'

# Check Weather (use token from login)
curl -X POST http://localhost:5000/api/weather/check \
  -H "Authorization: Bearer {token}"
```

## 📊 Data Type Mapping

| PostgreSQL | MongoDB | Notes |
|-----------|---------|-------|
| SERIAL | ObjectId | Auto-incrementing (automatic) |
| VARCHAR(n) | String | Text with length |
| INTEGER | Number | Whole numbers |
| DECIMAL(15,2) | Number | Decimals |
| TIMESTAMP | Date | Auto with createdAt/updatedAt |
| BOOLEAN | Boolean | true/false |
| TEXT | String | Long text |

## ⚡ Performance Considerations

### Advantages of MongoDB for This Project

✅ **Flexible Schema** - Easy to add fields without migrations
✅ **Document Storage** - No join complexity for nested data
✅ **Built-in Validation** - Schema-level constraints
✅ **Aggregation Framework** - Powerful data analysis
✅ **Easy to Scale** - Horizontal scaling with sharding
✅ **JSON Native** - Perfect for REST APIs

### Indexing

MongoDB models now include indexes:

```javascript
// Weather & Payout models
weatherSchema.index({ userId: 1, createdAt: -1 });
payoutSchema.index({ userId: 1, createdAt: -1 });
payoutSchema.index({ status: 1 });
```

These improve query performance significantly.

## 🔍 Debugging MongoDB

### Check MongoDB Connection
```javascript
const db = require('mongoose').connection;
console.log(db.readyState); // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
```

### View Data in MongoDB
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/gigshield_db

# List collections
show collections

# View documents
db.users.find()
db.weather.find()
db.payouts.find()

# Count documents
db.users.countDocuments()
```

## 🛠️ Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
→ Make sure MongoDB is running: mongod
```

### Mongoose Validation Error
```
ValidationError: email: Please provide a valid email
→ Check email format in request
```

### ObjectId Conversion Error
```
BSONTypeError: Argument passed to ObjectId constructor must be a valid ObjectId
→ Ensure userId is a valid MongoDB ObjectId string
```

### Environment Variable Not Found
```
MONGO_URI is undefined
→ Check .env file: MONGO_URI=mongodb://...
```

## 📚 Resources

- **Mongoose Docs:** https://mongoosejs.com/
- **MongoDB Guide:** https://docs.mongodb.com/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas

## ✅ Verification Checklist

After migration:

- [ ] MongoDB is running
- [ ] `.env` has `MONGO_URI`
- [ ] `npm install` completed
- [ ] Server starts without errors
- [ ] Health check works: `GET /health`
- [ ] User registration works
- [ ] User login works
- [ ] Weather check works
- [ ] Payout trigger works
- [ ] All previous tests pass

## 🎉 Migration Complete!

Your GigShield Backend is now running on MongoDB with Mongoose. All API endpoints work the same way as before, but with the benefits of MongoDB's flexible document model.
