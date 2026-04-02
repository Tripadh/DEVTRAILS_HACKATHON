# GigShield Backend - Quick Start Guide

## 📋 Project Overview

**GigShield Backend** is a weather-based crop insurance platform built with:
- Node.js + Express.js for the API server
- PostgreSQL for persistent data storage
- JWT for secure authentication
- ML integration for risk assessment
- OpenWeatherMap API for real-time weather data

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Setup PostgreSQL Database
```bash
# Create database
createdb gigshield_db

# Or in PostgreSQL CLI
psql -U postgres
CREATE DATABASE gigshield_db;
```

### Step 3: Configure Environment
Edit `.env` file in the `backend` folder:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gigshield_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=5000
JWT_SECRET=your_secret_key_here
OPENWEATHER_API_KEY=your_api_key
ML_API_URL=http://localhost:5001/predict
```

### Step 4: Start the Server
```bash
npm run dev
```

Expected output:
```
╔═══════════════════════════════════════╗
║     GigShield Backend Server Started   ║
║              Server Status: UP          ║
║          Listening on Port: 5000        ║
║   Environment: development             ║
╚═══════════════════════════════════════╝
```

Visit `http://localhost:5000/health` ✅

---

## 📁 Project Structure at a Glance

| Folder | Purpose |
|--------|---------|
| `config/` | Database connection setup |
| `models/` | Database queries & operations |
| `services/` | Business logic & workflows |
| `controllers/` | HTTP request handling |
| `routes/` | API endpoint definitions |
| `middleware/` | Auth, validation, error handling |
| `utils/` | Helper functions & constants |

---

## 🔌 Core API Endpoints

### Authentication
```
POST   /api/auth/register          # Create new user
POST   /api/auth/login             # Login user
GET    /api/auth/profile           # Get user profile (protected)
```

### Weather Management
```
POST   /api/weather/check          # Check & log weather (protected)
GET    /api/weather/logs           # Get weather history (protected)
GET    /api/weather/latest         # Latest weather data (protected)
POST   /api/weather/analyze-risk   # Analyze weather risk
```

### Payout System
```
POST   /api/payouts/trigger        # Trigger insurance payout (protected)
GET    /api/payouts/history        # Payout history (protected)
GET    /api/payouts/total          # Total payout amount (protected)
GET    /api/payouts/:id            # Payout details (protected)
PUT    /api/payouts/:id/status     # Update payout status (protected)
```

---

## 🧪 Testing with cURL

### 1. Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raj Kumar",
    "email": "raj@example.com",
    "password": "Test@123",
    "location": "Delhi",
    "crop_type": "rice"
  }'
```

Save the returned `token` for next requests.

### 2. Check Weather (Protected)
```bash
curl -X POST http://localhost:5000/api/weather/check \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### 3. Trigger Payout (Protected)
```bash
curl -X POST http://localhost:5000/api/payouts/trigger \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

---

## 🔐 Authentication Flow

1. **Register** → Receive JWT token (valid for 7 days)
2. **Login** → Receive JWT token
3. **Protected Routes** → Include token in header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 📊 Database Schema

Three main tables created automatically on first run:

**users** - User accounts & profiles
- id, name, email, password (hashed), location, crop_type

**weather_logs** - Historical weather records
- id, user_id, rainfall, temperature, humidity, description, created_at

**payouts** - Insurance payout records
- id, user_id, amount, status, risk_score, created_at, updated_at

---

## 🛠️ Development Tips

### Auto-reload During Development
```bash
npm run dev    # Uses nodemon
```

### Check Server Health
```bash
curl http://localhost:5000/health
```

### View Logs
- Server logs appear in terminal
- Includes request method, path, and timestamp

### Environment Variables
- Change settings in `.env` without code changes
- Never commit `.env` to git

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
# Windows: Services → PostgreSQL
# Mac: brew services list
# Linux: sudo systemctl status postgresql
```

### JWT Token Errors
```
"Invalid or expired token"
→ Token expired after 7 days, login again
→ Check Authorization header format: "Bearer {token}"
```

---

## 📚 File Overview

| File | Purpose |
|------|---------|
| `server.js` | Entry point, starts server & DB |
| `app.js` | Express configuration & routes |
| `config/db.js` | PostgreSQL connection & initialization |
| `constants.js` | Threshold values & error messages |
| `helpers.js` | JWT, password hashing, utilities |
| `axiosClient.js` | External API calls (Weather, ML) |

---

## ✨ Key Features Implemented

✅ **JWT Authentication** - Secure token-based access
✅ **Password Hashing** - bcryptjs for security
✅ **Input Validation** - Request validation middleware
✅ **Error Handling** - Centralized error responses
✅ **Auto Database Setup** - Tables created on startup
✅ **Async/Await** - Modern async patterns
✅ **ML Ready** - Weather → Risk Score → Payout flow
✅ **Clean Architecture** - Separated concerns (MVC pattern)

---

## 🔄 Typical User Flow

1. **User Registration/Login** → Get JWT token
2. **Import weatherData Check** → POST `/api/weather/check`
3. **Weather Logged** → Compare with thresholds
4. **Risk Analysis** → ML API analyzes risk
5. **Trigger Payout** → POST `/api/payouts/trigger` (if risk high)
6. **Payout Created** → Status = "pending"
7. **Admin Approves** → PUT `/api/payouts/:id/status` with "approved"

---

## 🚦 Next Steps

1. ✅ Start server: `npm run dev`
2. ✅ Create a test user: POST `/api/auth/register`
3. ✅ Check weather: POST `/api/weather/check`
4. ✅ Analyze risk: POST `/api/weather/analyze-risk`
5. ✅ Trigger payout: POST `/api/payouts/trigger`
6. ✅ View payouts: GET `/api/payouts/history`

---

## 📞 Support Files

- **README.md** - Full documentation
- **.env** - Configuration template
- **.gitignore** - Files to exclude from git
- **package.json** - Dependencies & scripts

---

**Happy Coding!** 🎉
