/**
 * Authentication Controller
 * Handles authentication-related HTTP requests
 */

const authService = require('../services/authService');
const otpService = require('../services/otpService');
const { formatResponse } = require('../utils/helpers');

/**
 * Register User - POST /api/auth/register
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, location, platform, role } = req.body;

    const result = await authService.registerUser({
      name,
      email,
      password,
      location: location || req.body.company || 'Bengaluru',
      platform: platform || role || 'worker',
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
 * Request OTP - POST /api/auth/request-otp
 * Creates a 6-digit OTP and prints it in the server console for local testing.
 */
const requestOtp = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = otpService.requestOtp(phone);

    res.status(200).json(
      formatResponse(true, result.message, {
        phone: result.phone,
        expiresIn: result.expiresIn,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP - POST /api/auth/verify-otp
 * Confirms the OTP and returns a JWT session for the frontend.
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const verification = otpService.verifyOtp(phone, otp);
    const session = await authService.createOtpSession(verification.phone);

    res.status(200).json(
      formatResponse(true, verification.message, {
        user: session.user,
        token: session.token,
      })
    );
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
    const user = await authService.getUserProfile(req.user);

    res.status(200).json(formatResponse(true, 'Profile retrieved successfully', user));
  } catch (error) {
    next(error);
  }
};

/**
 * Get Workers - GET /api/auth/workers
 * Returns all stored worker users for roster views.
 */
const getWorkers = async (req, res, next) => {
  try {
    const workers = await authService.listWorkers();

    res.status(200).json(formatResponse(true, 'Workers retrieved successfully', workers));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Worker - DELETE /api/auth/workers/:workerId
 * Removes a stored worker from the roster.
 */
const removeWorker = async (req, res, next) => {
  try {
    const { workerId } = req.params;
    const deletedWorker = await authService.deleteWorker(workerId);

    res.status(200).json(formatResponse(true, 'Worker deleted successfully', deletedWorker));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  requestOtp,
  verifyOtp,
  getProfile,
  getWorkers,
  removeWorker,
};
