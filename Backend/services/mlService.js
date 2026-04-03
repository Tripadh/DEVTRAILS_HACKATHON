/**
 * Machine Learning Service
 * Handles ML model predictions and risk analysis
 */

const { sendMLPrediction } = require('../utils/axiosClient');
const { isThresholdExceeded } = require('../utils/helpers');
const { THRESHOLDS, ERROR_MESSAGES, PAYOUT_AMOUNT } = require('../utils/constants');

const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:5001/predict-payout';

const normalizeEventType = (eventType) => {
  const normalizedEventType = String(eventType || '').trim().toUpperCase();

  if (normalizedEventType === 'RAIN') {
    return 'heavy_rain';
  }

  if (normalizedEventType === 'HEAT') {
    // The FastAPI service accepts extreme_heat, not heatwave.
    return 'extreme_heat';
  }

  if (normalizedEventType === 'FLOOD') {
    return 'flood';
  }

  if (normalizedEventType === 'CYCLONE') {
    return 'flood';
  }

  if (normalizedEventType === 'CURFEW') {
    return 'curfew';
  }

  return 'heavy_rain';
};

const buildMlPayload = (user, weatherData) => {
  return {
    worker_id: String(user._id),
    city: user.location,
    persona: user.persona || 'food',
    disruption_type: normalizeEventType(weatherData.eventType),
    rainfall_mm: Number(weatherData.rainfall ?? 0),
    temperature_celsius: Number(weatherData.temperature ?? 0),
    aqi: Number(weatherData.aqi ?? 200),
    wind_speed_kmh: Number(weatherData.wind_speed_kmh ?? 20),
    humidity: Number(weatherData.humidity ?? 80),
    worker_zone_risk_score: Number(weatherData.worker_zone_risk_score ?? 0.7),
    hours_lost: Number(weatherData.hours_lost ?? 4),
  };
};

const buildFallbackPrediction = (weatherData) => {
  const thresholdExceeded = isThresholdExceeded(weatherData, THRESHOLDS);

  if (!thresholdExceeded) {
    return {
      eligible: false,
      predicted_payout: 0,
      risk_level: 'low',
      message: 'No disruption risk detected - thresholds not exceeded',
      source: 'fallback',
    };
  }

  return {
    eligible: true,
    predicted_payout: PAYOUT_AMOUNT,
    risk_level: weatherData.eventType === 'HEAT' ? 'high' : 'medium',
    message: 'Fallback payout applied after ML API failure',
    source: 'fallback',
  };
};

/**
 * Get payout prediction from the external FastAPI service.
 * The payload is shaped to match ml-model/main.py.
 * @param {object} user - Authenticated user document
 * @param {object} weatherData - Latest weather snapshot
 * @returns {Promise<object>} ML prediction result
 */
const getRiskPrediction = async (user, weatherData) => {
  try {
    const payload = buildMlPayload(user, weatherData);
    const prediction = await sendMLPrediction(payload, ML_API_URL);

    return {
      eligible: Boolean(prediction.eligible),
      predicted_payout: Number(prediction.predicted_payout ?? 0),
      risk_level: prediction.risk_level || 'low',
      message: prediction.message || 'Payout prediction completed',
      source: 'ml',
      payload,
    };
  } catch (error) {
    throw new Error(`${ERROR_MESSAGES.ML_API_ERROR}: ${error.message}`);
  }
};

/**
 * Calculate Payout Amount
 * @param {number} riskScore - Risk score from ML model
 * @param {object} basePolicy - Optional payout policy details
 * @returns {number} Calculated payout amount
 */
const calculatePayoutAmount = (riskScore, basePolicy = {}) => {
  // GigShield default payout for disruption events
  const baseAmount = basePolicy.baseAmount || PAYOUT_AMOUNT;

  // Risk multiplier (0 to 1)
  const riskMultiplier = Math.min(riskScore / 100, 1);

  // Calculate final amount
  const payoutAmount = baseAmount * riskMultiplier;

  return Math.round(payoutAmount * 100) / 100; // Round to 2 decimal places
};

/**
 * Analyze disruption intensity
 * @param {object} weatherData - Weather snapshot
 * @returns {Promise<object>} Risk analysis result
 */
const analyzeWeatherRisk = async (weatherData) => {
  try {
    const riskFactors = {
      rainfallRisk: (weatherData.rainfall / THRESHOLDS.RAINFALL) * 100,
      temperatureRisk: (weatherData.temperature / THRESHOLDS.TEMPERATURE) * 100,
    };

    const averageRisk = (
      (riskFactors.rainfallRisk + riskFactors.temperatureRisk) / 2
    ).toFixed(2);

    return {
      riskFactors,
      averageRisk: parseFloat(averageRisk),
      isRisky: parseFloat(averageRisk) > 50,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getRiskPrediction,
  calculatePayoutAmount,
  analyzeWeatherRisk,
  buildMlPayload,
  buildFallbackPrediction,
};
