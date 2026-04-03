/**
 * Application Constants
 * Stores all constant values used throughout the application
 */

const THRESHOLDS = {
  RAINFALL: Number(process.env.RAIN_THRESHOLD || 100),
  TEMPERATURE: Number(process.env.TEMP_THRESHOLD || 40),
  FLOOD_RAINFALL: Number(process.env.FLOOD_RAIN_THRESHOLD || 80),
  HUMIDITY: Number(process.env.HUMIDITY_THRESHOLD || 85),
  WIND_SPEED: Number(process.env.WIND_SPEED_THRESHOLD || 25),
};

const PAYOUT_AMOUNT = Number(process.env.PAYOUT_AMOUNT || 300);

const PAYOUT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
};

const USER_ROLES = {
  GIG_WORKER: 'gig_worker',
  ADMIN: 'admin',
};

const ERROR_MESSAGES = {
  USER_EXISTS: 'User already exists',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid email or password',
  INVALID_PHONE: 'Please enter a valid phone number',
  OTP_INVALID: 'Invalid OTP',
  OTP_EXPIRED: 'OTP has expired. Please request a new one',
  UNAUTHORIZED: 'Unauthorized access',
  INVALID_TOKEN: 'Invalid or expired token',
  SERVER_ERROR: 'Internal server error',
  WEATHER_API_ERROR: 'Failed to fetch weather data',
  ML_API_ERROR: 'Failed to process ML prediction',
  DB_ERROR: 'Database operation failed',
};

const SUCCESS_MESSAGES = {
  USER_CREATED: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  WEATHER_CHECKED: 'Disruption event evaluated successfully',
  PAYOUT_TRIGGERED: 'Payout triggered successfully',
};

module.exports = {
  THRESHOLDS,
  PAYOUT_AMOUNT,
  PAYOUT_STATUS,
  USER_ROLES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
