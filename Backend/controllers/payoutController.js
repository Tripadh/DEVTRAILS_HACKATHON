/**
 * Payout Controller
 * Handles payout-related HTTP requests
 */

const payoutService = require('../services/payoutService');
const { formatResponse } = require('../utils/helpers');

/**
 * Trigger Payout - POST /api/payouts/trigger
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const triggerPayout = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await payoutService.triggerPayout(userId);

    const statusCode = result.payout ? 201 : 200;
    res.status(statusCode).json(formatResponse(true, result.message, {
      payout: result.payout,
      amount: result.amount,
      riskLevel: result.riskLevel,
      message: result.message,
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * Get Payout History - GET /api/payouts/history
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getPayoutHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = req.query.limit || 10;

    const payouts = await payoutService.getPayoutHistory(userId, parseInt(limit));

    res.status(200).json(formatResponse(true, 'Payout history retrieved successfully', payouts));
  } catch (error) {
    next(error);
  }
};

/**
 * Get Payout Details - GET /api/payouts/:payoutId
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getPayoutDetails = async (req, res, next) => {
  try {
    const { payoutId } = req.params;

    const payout = await payoutService.getPayoutDetails(payoutId);

    res.status(200).json(formatResponse(true, 'Payout details retrieved successfully', payout));
  } catch (error) {
    next(error);
  }
};

/**
 * Update Payout Status - PUT /api/payouts/:payoutId/status
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const updatePayoutStatus = async (req, res, next) => {
  try {
    const { payoutId } = req.params;
    const { status } = req.body;

    const payout = await payoutService.updatePayoutStatus(payoutId, status);

    res.status(200).json(formatResponse(true, 'Payout status updated successfully', payout));
  } catch (error) {
    next(error);
  }
};

/**
 * Get Total Payout - GET /api/payouts/total
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getTotalPayout = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const result = await payoutService.getTotalPayout(userId);

    res.status(200).json(formatResponse(true, 'Total payout retrieved successfully', result));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerPayout,
  getPayoutHistory,
  getPayoutDetails,
  updatePayoutStatus,
  getTotalPayout,
};
