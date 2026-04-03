/**
 * Weather Controller
 * Handles weather-related HTTP requests
 */

const weatherService = require('../services/weatherService');
const mlService = require('../services/mlService');
const { formatResponse } = require('../utils/helpers');

/**
 * Check Disruption Event - POST /api/weather/check
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const checkWeather = async (req, res, next) => {
  try {
    const { location } = req.body;
    const userId = req.user?.userId || null;

    const result = await weatherService.checkWeather(location, userId);

    res.status(200).json(formatResponse(true, result.message, {
      temperature: result.temperature,
      rainfall: result.rainfall,
      humidity: result.humidity,
      windSpeed: result.windSpeed,
      eventType: result.eventType,
      disruption: result.disruption,
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * Get Weather Logs - GET /api/weather/logs
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getWeatherLogs = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = req.query.limit || 10;

    const logs = await weatherService.getWeatherLogs(userId, parseInt(limit));

    res.status(200).json(formatResponse(true, 'Weather logs retrieved successfully', logs));
  } catch (error) {
    next(error);
  }
};

/**
 * Get Latest Weather - GET /api/weather/latest
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const getLatestWeather = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const weather = await weatherService.getLatestWeather(userId);

    res.status(200).json(formatResponse(true, 'Latest weather retrieved successfully', weather));
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze Disruption Risk - POST /api/weather/analyze-risk
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
const analyzeRisk = async (req, res, next) => {
  try {
    const { rainfall, temperature } = req.body;

    const analysis = await mlService.analyzeWeatherRisk({
      rainfall: parseFloat(rainfall),
      temperature: parseFloat(temperature),
    });

    res.status(200).json(formatResponse(true, 'Weather risk analysis completed', analysis));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkWeather,
  getWeatherLogs,
  getLatestWeather,
  analyzeRisk,
};
