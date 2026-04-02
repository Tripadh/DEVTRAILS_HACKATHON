/**
 * Weather Service
 * Handles weather data retrieval and processing
 */

const axios = require('axios');
const Weather = require('../models/weatherModel');
const User = require('../models/userModel');
const { ERROR_MESSAGES, SUCCESS_MESSAGES, THRESHOLDS } = require('../utils/constants');

const detectEventType = (rainfall, temperature) => {
  if (rainfall > THRESHOLDS.RAINFALL) {
    return 'RAIN';
  }
  if (temperature > THRESHOLDS.TEMPERATURE) {
    return 'HEAT';
  }
  return 'NORMAL';
};

const fetchWeatherSnapshot = async (location) => {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    console.log('Loaded API KEY:', apiKey);

    if (!apiKey) {
      throw new Error('Missing WEATHER_API_KEY in environment variables');
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: location,
        appid: apiKey,
        units: 'metric',
      },
      timeout: 10000,
    });

    return {
      temperature: response.data.main?.temp ?? 0,
      humidity: response.data.main?.humidity ?? 0,
      rainfall: response.data.rain?.['1h'] ?? 0,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('Invalid location');
    }

    if (error.response?.status === 401) {
      throw new Error('Invalid or inactive OpenWeather API key');
    }

    throw new Error(`Unable to fetch weather data: ${error.message}`);
  }
};

/**
 * Check real-time weather and detect disruption
 * @param {string} location - City name
 * @param {string | null} userId - Optional authenticated user ID
 * @returns {Promise<object>} Disruption weather object
 */
const checkWeather = async (location, userId = null) => {
  try {
    if (!location) {
      throw new Error('Location is required');
    }

    // Fetch weather data from OpenWeatherMap
    const weatherData = await fetchWeatherSnapshot(location);

    const eventType = detectEventType(weatherData.rainfall, weatherData.temperature);
    const disruption = eventType !== 'NORMAL';

    // Persist disruption event when an authenticated user is available
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      await Weather.create({
        userId,
        rainfall: weatherData.rainfall,
        temperature: weatherData.temperature,
        eventType,
      });
    }

    return {
      temperature: weatherData.temperature,
      rainfall: weatherData.rainfall,
      humidity: weatherData.humidity,
      eventType,
      disruption,
      message: SUCCESS_MESSAGES.WEATHER_CHECKED,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get Weather Logs
 * @param {string} userId - User ID (MongoDB ObjectId)
 * @param {number} limit - Number of records to return
 * @returns {Promise<array>} Disruption event logs
 */
const getWeatherLogs = async (userId, limit = 10) => {
  try {
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const logs = await Weather.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);

    return logs.map(log => ({
      id: log._id,
      userId: log.userId,
      rainfall: log.rainfall,
      temperature: log.temperature,
      eventType: log.eventType,
      isDisruption: log.eventType !== 'NORMAL',
      createdAt: log.createdAt,
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get Latest Disruption Event
 * @param {string} userId - User ID (MongoDB ObjectId)
 * @returns {Promise<object>} Latest event
 */
const getLatestWeather = async (userId) => {
  try {
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    const log = await Weather.findOne({ userId }).sort({ createdAt: -1 });
    if (!log) {
      throw new Error('No disruption event data found');
    }

    return {
      id: log._id,
      userId: log.userId,
      rainfall: log.rainfall,
      temperature: log.temperature,
      eventType: log.eventType,
      isDisruption: log.eventType !== 'NORMAL',
      createdAt: log.createdAt,
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  checkWeather,
  getWeatherLogs,
  getLatestWeather,
};
