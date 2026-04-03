/**
 * Payout Service
 * Handles payout calculation, creation, and management
 */

const Payout = require('../models/payoutModel');
const Weather = require('../models/weatherModel');
const User = require('../models/userModel');
const mlService = require('./mlService');
const mongoose = require('mongoose');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, PAYOUT_STATUS, PAYOUT_AMOUNT } = require('../utils/constants');

const disruptionReasonMap = {
  RAIN: 'Heavy Rain Disruption',
  HEAT: 'Extreme Heat Disruption',
  FLOOD: 'Flood Disruption',
  CYCLONE: 'Cyclone Disruption',
  CURFEW: 'Curfew Disruption',
  NORMAL: 'No disruption',
};

/**
 * Trigger Payout from latest disruption event
 * @param {string} userId - User ID (MongoDB ObjectId)
 * @param {object} options - Optional activation metadata
 * @returns {Promise<object>} Payout result
 */
const triggerPayout = async (userId, options = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const latestWeather = await Weather.findOne({ userId }).sort({ createdAt: -1 });
    if (!latestWeather) {
      const error = new Error('No disruption event data found for user. Run /api/weather/check first.');
      error.statusCode = 400;
      throw error;
    }

    if (latestWeather.eventType === 'NORMAL') {
      return {
        payout: false,
        amount: 0,
        riskLevel: 'low',
        message: 'No payout triggered - no disruption event detected',
      };
    }

    let prediction;

    try {
      // Build the ML payload from user + weather context and ask the external FastAPI service.
      prediction = await mlService.getRiskPrediction(user, latestWeather);
    } catch (mlError) {
      // If the ML API is unavailable, fall back to a simple weather threshold rule.
      prediction = mlService.buildFallbackPrediction({
        rainfall: latestWeather.rainfall,
        temperature: latestWeather.temperature,
        eventType: latestWeather.eventType,
      });
    }

    if (!prediction.eligible) {
      return {
        payout: false,
        amount: 0,
        riskLevel: prediction.risk_level || 'low',
        message: prediction.message || 'No payout triggered - disruption risk below payout threshold',
      };
    }

    const payoutAmount = Number(prediction.predicted_payout || PAYOUT_AMOUNT);

    const payout = await Payout.create({
      userId: userId,
      amount: payoutAmount,
      planName: options.planName || null,
      upiId: options.upiId || null,
      reason: options.planName
        ? `ML-based disruption - ${options.planName}`
        : disruptionReasonMap[latestWeather.eventType] || 'ML-based disruption',
      status: PAYOUT_STATUS.PAID,
    });

    return {
      payout: true,
      amount: payout.amount,
      riskLevel: prediction.risk_level || 'medium',
      planName: options.planName || null,
      upiId: options.upiId || null,
      message: prediction.message || SUCCESS_MESSAGES.PAYOUT_TRIGGERED,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get Payout History
 * @param {string} userId - User ID (MongoDB ObjectId)
 * @param {number} limit - Number of records to return
 * @returns {Promise<array>} Payout history
 */
const getPayoutHistory = async (userId, limit = 10) => {
  try {
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const payouts = await Payout.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return payouts.map(payout => ({
      id: payout._id,
      userId: payout.userId,
      amount: payout.amount,
      reason: payout.reason,
      status: payout.status,
      createdAt: payout.createdAt,
      updatedAt: payout.updatedAt,
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get Payout Details
 * @param {string} payoutId - Payout ID (MongoDB ObjectId)
 * @returns {Promise<object>} Payout details
 */
const getPayoutDetails = async (payoutId) => {
  try {
    const payout = await Payout.findById(payoutId);
    if (!payout) {
      throw new Error('Payout not found');
    }

    return {
      id: payout._id,
      userId: payout.userId,
      amount: payout.amount,
      reason: payout.reason,
      status: payout.status,
      createdAt: payout.createdAt,
      updatedAt: payout.updatedAt,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Update Payout Status
 * @param {string} payoutId - Payout ID (MongoDB ObjectId)
 * @param {string} status - New status
 * @returns {Promise<object>} Updated payout
 */
const updatePayoutStatus = async (payoutId, status) => {
  try {
    // Validate status
    const validStatuses = Object.values(PAYOUT_STATUS);
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid payout status');
    }

    const payout = await Payout.findByIdAndUpdate(
      payoutId,
      { status },
      { new: true, runValidators: true }
    );

    if (!payout) {
      throw new Error('Failed to update payout');
    }

    return {
      id: payout._id,
      userId: payout.userId,
      amount: payout.amount,
      reason: payout.reason,
      status: payout.status,
      createdAt: payout.createdAt,
      updatedAt: payout.updatedAt,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get Total Payout Amount
 * @param {string} userId - User ID (MongoDB ObjectId)
 * @returns {Promise<object>} Total payout amount
 */
const getTotalPayout = async (userId) => {
  try {
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Aggregate total amount for paid payouts
    const result = await Payout.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId), status: PAYOUT_STATUS.PAID } },
      { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
    ]);

    const totalAmount = result.length > 0 ? result[0].totalAmount : 0;

    return {
      totalAmount: totalAmount,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  triggerPayout,
  getPayoutHistory,
  getPayoutDetails,
  updatePayoutStatus,
  getTotalPayout,
};
