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
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.USER_EXISTS);
    }

    // Hash password before storing in database
    const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);

    // Create user document
    const user = await User.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      location: userData.location,
      platform: userData.platform,
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
    throw error;
  }
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
const getUserProfile = async (userId) => {
  try {
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

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};
