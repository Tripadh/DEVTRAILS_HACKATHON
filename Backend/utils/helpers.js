/**
 * Helper Functions
 * Utility functions for common operations
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/**
 * Generate JWT Token
 * @param {number} userId - User ID
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '7d' }
  );
};

/**
 * Verify JWT Token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
};

/**
 * Hash Password
 * @param {string} password - Password to hash
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compare Password
 * @param {string} password - Plain password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>} True if passwords match
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Check if threshold exceeded
 * @param {object} weatherData - Weather data
 * @param {object} thresholds - Threshold values
 * @returns {boolean} True if any threshold is exceeded
 */
const isThresholdExceeded = (weatherData, thresholds) => {
  return (
    weatherData.rainfall > thresholds.RAINFALL ||
    weatherData.temperature > thresholds.TEMPERATURE
  );
};

/**
 * Format API Response
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {object} data - Response data
 * @returns {object} Formatted response
 */
const formatResponse = (success, message, data = null) => {
  return {
    success,
    message,
    data,
  };
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  isThresholdExceeded,
  formatResponse,
};
