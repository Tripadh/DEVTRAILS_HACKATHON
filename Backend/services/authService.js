/**
 * Authentication Service
 * Handles user registration and login logic
 */

const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

const SALT_ROUNDS = 10;

/**
 * Register User
 * @param {object} userData - User data
 * @returns {Promise<object>} User and token
 */
const registerUser = async (userData) => {
  try {
    const name = String(userData.name || '').trim();
    const email = String(userData.email || '').trim().toLowerCase();
    const password = String(userData.password || '');
    const location = String(userData.location || 'Bengaluru').trim() || 'Bengaluru';
    const platform = String(userData.platform || 'worker').trim() || 'worker';

    if (!name) {
      const error = new Error('Name is required');
      error.statusCode = 400;
      throw error;
    }

    if (!email) {
      const error = new Error('Email is required');
      error.statusCode = 400;
      throw error;
    }

    if (!password) {
      const error = new Error('Password is required');
      error.statusCode = 400;
      throw error;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.USER_EXISTS);
    }

    // Hash password before storing in database
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user document
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      location,
      platform,
    });

    // Generate JWT token for authenticated sessions
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        platform: user.platform,
      },
      token,
      message: SUCCESS_MESSAGES.USER_CREATED,
    };
  } catch (error) {
    if (error.code === 11000) {
      error.statusCode = 400;
      error.message = ERROR_MESSAGES.USER_EXISTS;
    }

    if (error.name === 'ValidationError') {
      error.statusCode = 400;
      error.message = Object.values(error.errors)
        .map((item) => item.message)
        .join(', ');
    }

    throw error;
  }
};

/**
 * Create OTP Session
 * Builds a lightweight user session after a successful OTP verification.
 * The user object is stored in the JWT so /profile can work without a database record.
 */
const createOtpSession = async (phone) => {
  const lastFourDigits = String(phone).slice(-4) || '0000';
  const user = {
    id: `otp-${phone}`,
    name: `Gig Worker ${lastFourDigits}`,
    phone,
    email: null,
    location: 'Bengaluru',
    platform: 'worker',
  };

  const token = jwt.sign(
    { user },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    user,
    token,
    message: SUCCESS_MESSAGES.OTP_VERIFIED,
  };
};

/**
 * Login User
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} User and token
 */
const loginUser = async (email, password) => {
  try {
    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      error.statusCode = 401;
      throw error;
    }

    // Generate JWT token for authenticated sessions
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        platform: user.platform,
      },
      token,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get User Profile
 * @param {string} userId - User ID (MongoDB ObjectId)
 * @returns {Promise<object>} User profile
 */
const getUserProfile = async (authContext) => {
  try {
    if (authContext?.user) {
      return authContext.user;
    }

    const userId = typeof authContext === 'string' ? authContext : authContext?.userId;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      platform: user.platform,
      createdAt: user.createdAt,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * List Workers
 * Returns stored worker users for roster views.
 */
const listWorkers = async () => {
  try {
    const workers = await User.find({ platform: 'worker' })
      .select('name email location platform createdAt')
      .sort({ createdAt: -1 });

    return workers.map((worker) => ({
      id: worker._id,
      name: worker.name,
      email: worker.email,
      location: worker.location,
      platform: worker.platform,
      createdAt: worker.createdAt,
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Delete Worker
 * Removes a stored worker by ID.
 */
const deleteWorker = async (workerId) => {
  try {
    const deletedWorker = await User.findByIdAndDelete(workerId);

    if (!deletedWorker) {
      const error = new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      error.statusCode = 404;
      throw error;
    }

    return {
      id: deletedWorker._id,
      name: deletedWorker.name,
      email: deletedWorker.email,
      location: deletedWorker.location,
      platform: deletedWorker.platform,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  createOtpSession,
  getUserProfile,
  listWorkers,
  deleteWorker,
};
