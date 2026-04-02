/**
 * Machine Learning Service
 * Handles ML model predictions and risk analysis
 */

const { sendMLPrediction } = require('../utils/axiosClient');
const { isThresholdExceeded } = require('../utils/helpers');
const { THRESHOLDS, ERROR_MESSAGES, PAYOUT_AMOUNT } = require('../utils/constants');

/**
 * Get Risk Prediction for disruption event
 * @param {object} weatherData - Weather snapshot
 * @returns {Promise<object>} ML prediction result
 */
const getRiskPrediction = async (weatherData) => {
  try {
    // Check if thresholds exceeded
    const thresholdExceeded = isThresholdExceeded(weatherData, THRESHOLDS);

    if (!thresholdExceeded) {
      return {
        riskScore: 0,
        payoutDecision: false,
        payoutAmount: 0,
        message: 'No disruption risk detected - thresholds not exceeded',
      };
    }

    // Send to ML API for prediction
    const prediction = await sendMLPrediction(weatherData);

    return {
      riskScore: prediction.riskScore,
      payoutDecision: prediction.payoutDecision,
      payoutAmount: prediction.payoutAmount,
      message: 'Risk prediction completed',
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
};
