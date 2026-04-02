# GigShield Backend

A comprehensive Node.js backend system for weather-based crop insurance with ML-powered risk assessment. Built with Express.js and MongoDB using Mongoose for clean, scalable architecture.

## Project Structure

```
backend/
├── config/              # Configuration files (MongoDB setup)
├── routes/              # API route definitions
├── controllers/         # Request/response handling
├── services/            # Business logic and operations
├── models/              # Mongoose schemas and models
├── middleware/          # Authentication, validation, error handling
├── utils/               # Helper functions and constants
├── app.js               # Express application setup
├── server.js            # Entry point
├── package.json         # Dependencies
└── .env                 # Environment variables
```

## Architecture Overview

The project follows a **3-layer clean architecture**:

1. **Controllers** - Handle HTTP requests and responses
2. **Services** - Contain business logic and orchestration
3. **Models** - Manage database operations with Mongoose

**Supporting Layers:**
- **Middleware** - Cross-cutting concerns (auth, validation, error handling)
- **Utils** - Reusable helper functions and constants
- **Config** - Database and external service configuration
- **Routes** - HTTP route mappings

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 4.18.2
- **Database:** MongoDB with Mongoose 7.0.0 (ODM)
- **Authentication:** JWT (jsonwebtoken)
- **Password Security:** bcryptjs
- **HTTP Client:** Axios
- **Environment:** dotenv
- **CORS:** cors

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+) - Local or Atlas Cloud
- npm or yarn

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   - Copy/edit `.env` file:
   ```bash
   # MongoDB Connection
   MONGO_URI=mongodb://localhost:27017/gigshield_db
   
   # Or use MongoDB Atlas
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigshield_db
   
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   
   OPENWEATHER_API_KEY=your_api_key
   ML_API_URL=http://localhost:5001/predict
   RAINFALL_THRESHOLD=50
   TEMPERATURE_THRESHOLD=35
   HUMIDITY_THRESHOLD=80
   ```

3. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Connection string in .env
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@example.com",
  "password": "securePass123",
  "location": "Punjab",
  "crop_type": "wheat"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Farmer",
      "email": "john@example.com",
      "location": "Punjab",
      "crop_type": "wheat"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePass123"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer {token}
```

---

### Weather Endpoints (Protected)

#### Check Weather & Log Data
```http
POST /api/weather/check
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Weather data retrieved successfully",
  "data": {
    "id": "607f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "rainfall": 45.5,
    "temperature": 32.1,
    "humidity": 78.5,
    "description": "Moderate rain",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Weather Logs
```http
GET /api/weather/logs?limit=10
Authorization: Bearer {token}
```

#### Get Latest Weather
```http
GET /api/weather/latest
Authorization: Bearer {token}
```

#### Analyze Weather Risk
```http
POST /api/weather/analyze-risk
Content-Type: application/json

{
  "rainfall": 55.0,
  "temperature": 38.0,
  "humidity": 85.0
}
```

---

### Payout Endpoints (Protected)

#### Trigger Payout
```http
POST /api/payouts/trigger
Authorization: Bearer {token}
```

**Response (Payout Triggered):**
```json
{
  "success": true,
  "message": "Payout triggered successfully",
  "data": {
    "id": "707f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "amount": 3500.50,
    "status": "pending",
    "riskScore": 85.3,
    "createdAt": "2024-01-15T10:35:00Z"
  }
}
```

#### Get Payout History
```http
GET /api/payouts/history?limit=10
Authorization: Bearer {token}
```

#### Get Total Payout Amount
```http
GET /api/payouts/total
Authorization: Bearer {token}
```

#### Get Payout Details
```http
GET /api/payouts/{payoutId}
Authorization: Bearer {token}
```

#### Update Payout Status
```http
PUT /api/payouts/{payoutId}/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "approved"
}
```

---

## Database Schema (MongoDB)

### User Collection
```javascript
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique),
  "password": String (hashed),
  "location": String,
  "crop_type": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Weather Collection
```javascript
{
  "_id": ObjectId,
  "userId": ObjectId (ref: User),
  "rainfall": Number,
  "temperature": Number,
  "humidity": Number,
  "description": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

### Payout Collection
```javascript
{
  "_id": ObjectId,
  "userId": ObjectId (ref: User),
  "amount": Number,
  "status": String (enum: pending, approved, rejected, paid),
  "riskScore": Number,
  "createdAt": Date,
  "updatedAt": Date
}
```

## Configuration & Constants

### Thresholds (in `utils/constants.js`)
```javascript
RAINFALL_THRESHOLD: 50 mm
TEMPERATURE_THRESHOLD: 35°C
HUMIDITY_THRESHOLD: 80%
```

### Payout Status Values
- `pending` - Awaiting approval
- `approved` - Approved for payment
- `rejected` - Payment rejected
- `paid` - Amount paid to user

## Authentication

The API uses **JWT (JSON Web Tokens)** for authentication:

1. **Register/Login** → Receive token
2. **Include Token** in Authorization header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. **Token Expiration** - 7 days

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### Common Error Codes
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (invalid token)
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

### Key Features

✅ **MongoDB/Mongoose** - Document-based database
✅ **Clean Architecture** - Separation of concerns
✅ **JWT Authentication** - Secure token-based auth
✅ **Password Hashing** - bcryptjs for security
✅ **Input Validation** - Schema-level validation
✅ **Error Handling** - Centralized error management
✅ **Environment Variables** - Secure configuration
✅ **ML Integration** - Ready for predictions
✅ **Weather API Integration** - OpenWeatherMap support
✅ **Async/Await** - Modern async patterns

## MongoDB Setup

### Local MongoDB

1. **Install MongoDB:**
   - Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
   - Mac: `brew install mongodb-community`
   - Linux: https://docs.mongodb.com/manual/installation/

2. **Start MongoDB:**
   ```bash
   mongod
   ```

### MongoDB Atlas (Cloud)

1. **Create Account:** https://www.mongodb.com/cloud/atlas
2. **Create Cluster** and get connection string
3. **Update .env:**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/gigshield_db
   ```

## Mongoose Resources

- **Official Docs:** https://mongoosejs.com/
- **Schema Validation:** https://mongoosejs.com/docs/validation.html
- **Query Methods:** https://mongoosejs.com/docs/queries.html
- **Aggregation:** https://mongoosejs.com/docs/api/aggregate.html

## Migration from PostgreSQL

If migrating from PostgreSQL, see [MONGODB_MIGRATION.md](MONGODB_MIGRATION.md) for detailed migration guide.

## Future Enhancements

- [ ] Rate limiting middleware
- [ ] Request logging and monitoring
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Unit and integration tests
- [ ] Database backup and restore
- [ ] Role-based access control (RBAC)
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Caching with Redis
- [ ] Performance monitoring

## Contributing

1. Follow the layered architecture pattern
2. Keep controllers thin (request/response only)
3. Put business logic in services
4. Use async/await consistently
5. Add proper error handling
6. Document complex functions

## License

ISC

---

**Questions?** Check the code comments for detailed explanations in each module. See [MONGODB_MIGRATION.md](MONGODB_MIGRATION.md) for PostgreSQL to MongoDB migration details.

