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
 * GET /api/auth/profile
 * Get user profile (Protected route)
 */
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router;
