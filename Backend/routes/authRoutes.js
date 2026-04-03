/**
 * Authentication Routes
 * Routes for user registration, login, and profile management
 */

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  validateRequiredFields,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateOtpCode,
} = require('../middleware/validateRequest');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  validateRequiredFields(['name', 'email', 'password', 'location', 'platform']),
  validateEmail,
  validatePassword,
  authController.register
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  validateRequiredFields(['email', 'password']),
  validateEmail,
  authController.login
);

/**
 * POST /api/auth/request-otp
 * Generate a temporary OTP for phone number login.
 */
router.post(
  '/request-otp',
  validateRequiredFields(['phone']),
  validatePhoneNumber,
  authController.requestOtp
);

/**
 * POST /api/auth/verify-otp
 * Verify the OTP and create an authenticated session.
 */
router.post(
  '/verify-otp',
  validateRequiredFields(['phone', 'otp']),
  validatePhoneNumber,
  validateOtpCode,
  authController.verifyOtp
);

/**
 * GET /api/auth/profile
 * Get user profile (Protected route)
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * GET /api/auth/workers
 * Get stored workers for roster views.
 */
router.get('/workers', authenticateToken, authController.getWorkers);

/**
 * DELETE /api/auth/workers/:workerId
 * Delete a worker from the roster.
 */
router.delete('/workers/:workerId', authenticateToken, authController.removeWorker);

module.exports = router;
