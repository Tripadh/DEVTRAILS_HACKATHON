/**
 * Dev Routes
 * Local-only helpers for smoke testing and development workflows
 */

const express = require('express');
const router = express.Router();

const Weather = require('../models/weatherModel');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateRequiredFields } = require('../middleware/validateRequest');

router.post(
  '/seed-weather',
  authenticateToken,
  validateRequiredFields(['location']),
  async (req, res, next) => {
    try {
      const userId = req.user.userId;
      const { rainfall = 120, temperature = 45, eventType = 'HEAT' } = req.body;

      const weather = await Weather.create({
        userId,
        rainfall,
        temperature,
        eventType,
      });

      res.status(201).json({
        success: true,
        message: 'Weather seeded successfully',
        data: {
          id: weather._id,
          userId: weather.userId,
          rainfall: weather.rainfall,
          temperature: weather.temperature,
          eventType: weather.eventType,
        },
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;