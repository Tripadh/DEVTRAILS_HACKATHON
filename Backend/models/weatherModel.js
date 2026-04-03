/**
 * Disruption Event Model
 * Mongoose schema and model for disruption events collection
 */

const mongoose = require('mongoose');

/**
 * Disruption Event Schema
 * Defines disruption events for gig workers in MongoDB
 */
const weatherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    rainfall: {
      type: Number,
      default: 0,
      min: [0, 'Rainfall cannot be negative'],
    },
    humidity: {
      type: Number,
      default: 0,
      min: [0, 'Humidity cannot be negative'],
      max: [100, 'Humidity cannot exceed 100'],
    },
    temperature: {
      type: Number,
      default: 0,
      min: [-50, 'Temperature is too low'],
      max: [60, 'Temperature is too high'],
    },
    windSpeed: {
      type: Number,
      default: 0,
      min: [0, 'Wind speed cannot be negative'],
    },
    eventType: {
      type: String,
      enum: ['RAIN', 'HEAT', 'FLOOD', 'CYCLONE', 'CURFEW', 'NORMAL'],
      default: 'NORMAL',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for faster queries
weatherSchema.index({ userId: 1, createdAt: -1 });

// Create and export disruption event model
const Weather = mongoose.model('Weather', weatherSchema);

module.exports = Weather;

