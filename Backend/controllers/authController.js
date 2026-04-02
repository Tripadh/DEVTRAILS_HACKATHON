/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

const authService = require('../services/authService');
const { formatResponse } = require('../utils/helpers');

/**
 * Register User - POST /api/auth/register
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, location, platform } = req.body;

    const result = await authService.registerUser({
      name,
      email,
      password,
      location,
      platform,
    });

    res.status(201).json(formatResponse(true, result.message, {
      user: result.user,
      token: result.token,
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * Login User - POST /api/auth/login
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.status(200).json(formatResponse(true, result.message, {
      user: result.user,
      token: result.token,
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * Get User Profile - GET /api/auth/profile
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await authService.getUserProfile(userId);

    res.status(200).json(formatResponse(true, 'Profile retrieved successfully', user));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
};
