/**
 * Application Constants
 * Stores all constant values used throughout the application
 */

const THRESHOLDS = {
  RAINFALL: Number(process.env.RAIN_THRESHOLD || 100),
  TEMPERATURE: Number(process.env.TEMP_THRESHOLD || 40),
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
