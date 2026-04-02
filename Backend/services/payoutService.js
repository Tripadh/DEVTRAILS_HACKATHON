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
  NORMAL: 'No disruption',
};

/**
 * Trigger Payout from latest disruption event
 * @param {string} userId - User ID (MongoDB ObjectId)
 * @returns {Promise<object>} Payout result
 */
const triggerPayout = async (userId) => {
  try {
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Get latest disruption event snapshot
    const latestWeather = await Weather.findOne({ userId }).sort({ createdAt: -1 });
    if (!latestWeather) {
      const error = new Error('No disruption event data found for user. Run /api/weather/check first.');
      error.statusCode = 400;
      throw error;
    }

    if (latestWeather.eventType === 'NORMAL') {
      return {
        payoutDecision: false,
        message: 'No payout triggered - no disruption event detected',
    }
    }

    // Get ML prediction
    const prediction = await mlService.getRiskPrediction({
      rainfall: latestWeather.rainfall,
      temperature: latestWeather.temperature,
    });

    // If ML decides against payout on disruption event, stop here
    if (prediction.payoutDecision === false) {
      return {
        payoutDecision: false,
        message: 'No payout triggered - disruption risk below payout threshold',
      };
    }

    // Fixed payout with optional ML-informed override
    const payoutAmount = prediction.payoutAmount
      || mlService.calculatePayoutAmount(prediction.riskScore, { baseAmount: PAYOUT_AMOUNT });

    const reason = disruptionReasonMap[latestWeather.eventType] || 'External disruption';

    // Create payout record
    const payout = await Payout.create({
      userId: userId,
      amount: payoutAmount,
      reason,
      status: PAYOUT_STATUS.PENDING,
    });

    return {
      payout: {
        id: payout._id,
        userId: payout.userId,
        amount: payout.amount,
        reason: payout.reason,
        status: payout.status,
        createdAt: payout.createdAt,
      },
      message: SUCCESS_MESSAGES.PAYOUT_TRIGGERED,
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
