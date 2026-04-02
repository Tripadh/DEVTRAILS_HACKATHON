/**
 * Payout Routes
 * Routes for payout management and history
 */

const express = require('express');
const router = express.Router();

const payoutController = require('../controllers/payoutController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateRequiredFields } = require('../middleware/validateRequest');

/**
 * POST /api/payouts/trigger
 * Trigger payout for user (Protected route)
 */
router.post('/trigger', authenticateToken, payoutController.triggerPayout);

/**
 * GET /api/payouts/history
 * Get payout history (Protected route)
 * Query params: limit (optional)
 */
router.get('/history', authenticateToken, payoutController.getPayoutHistory);

/**
 * GET /api/payouts/total
 * Get total payout amount (Protected route)
 */
router.get('/total', authenticateToken, payoutController.getTotalPayout);

/**
 * GET /api/payouts/:payoutId
 * Get specific payout details (Protected route)
 */
router.get('/:payoutId', authenticateToken, payoutController.getPayoutDetails);

/**
 * PUT /api/payouts/:payoutId/status
 * Update payout status (Protected route)
 */
router.put(
  '/:payoutId/status',
  authenticateToken,
  validateRequiredFields(['status']),
  payoutController.updatePayoutStatus
);

module.exports = router;
