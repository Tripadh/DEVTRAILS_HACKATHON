/**
 * Weather Routes
 * Routes for weather data checking and analysis
 */

const express = require('express');
const router = express.Router();

const weatherController = require('../controllers/weatherController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateRequiredFields } = require('../middleware/validateRequest');

/**
 * POST /api/weather/check
 * Check real-time weather and detect disruption
 */
router.post('/check', authenticateToken, validateRequiredFields(['location']), weatherController.checkWeather);

/**
 * GET /api/weather/logs
 * Get weather logs for user (Protected route)
 * Query params: limit (optional)
 */
router.get('/logs', authenticateToken, weatherController.getWeatherLogs);

/**
 * GET /api/weather/latest
 * Get latest weather data (Protected route)
 */
router.get('/latest', authenticateToken, weatherController.getLatestWeather);

/**
 * POST /api/weather/analyze-risk
 * Analyze weather risk
 */
router.post(
  '/analyze-risk',
  validateRequiredFields(['rainfall', 'temperature']),
  weatherController.analyzeRisk
);

module.exports = router;
