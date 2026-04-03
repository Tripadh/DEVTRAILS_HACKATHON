/**
 * Server Entry Point
 * Starts the Express server and initializes MongoDB connection
 */

require('dotenv').config();
const app = require('./app');
const { connectDatabase } = require('./config/db');

const PORT = process.env.PORT || 5000;

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDatabase();

    // Start listening
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════╗
║     GigShield Backend Server Started   ║
║              Server Status: UP          ║
║          Listening on Port: ${PORT}       ║
║   Environment: ${process.env.NODE_ENV || 'development'}           ║
║        Database: MongoDB Ready          ║
╚═══════════════════════════════════════╝
      `);
      console.log('API Endpoints:');
      console.log('  - Authorization: POST /api/auth/register, POST /api/auth/login');
      console.log('  - OTP Auth: POST /api/auth/request-otp, POST /api/auth/verify-otp');
      console.log('  - Weather: POST /api/weather/check, GET /api/weather/logs');
      console.log('  - Payout: POST /api/payouts/trigger, GET /api/payouts/history');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Start the server
startServer();
