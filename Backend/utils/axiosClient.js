/**
 * Axios HTTP Client
 * Centralized HTTP client for external API calls
 */

const axios = require('axios');

/**
 * Create Axios instance with default config
 */
const client = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch Weather Data from OpenWeatherMap API
 * @param {string} location - Location name or coordinates
 * @param {string} apiKey - OpenWeatherMap API key
 * @returns {Promise<object>} Weather data
 */
const fetchWeatherData = async (location, apiKey) => {
  try {
    const response = await client.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: location,
        appid: apiKey,
        units: 'metric',
      },
    });

    return {
      temperature: response.data.main?.temp || 0,
      rainfall: response.data.rain?.['1h'] || 0,
      timestamp: new Date(),
    };
  } catch (error) {
    throw new Error(`Weather API Error: ${error.message}`);
  }
};

/**
 * Send Prediction Request to ML API
 * @param {object} weatherData - Weather data
 * @returns {Promise<object>} ML prediction result
 */
const sendMLPrediction = async (weatherData) => {
  try {
    const response = await client.post(process.env.ML_API_URL, {
      rainfall: weatherData.rainfall,
      temperature: weatherData.temperature,
    });

    return {
      riskScore: response.data.riskScore || 0,
      payoutDecision: response.data.payoutDecision || false,
      payoutAmount: response.data.payoutAmount || 0,
    };
  } catch (error) {
    throw new Error(`ML API Error: ${error.message}`);
  }
};

module.exports = {
  client,
  fetchWeatherData,
  sendMLPrediction,
};
