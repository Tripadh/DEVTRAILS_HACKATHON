/**
 * Payout Model
 * Mongoose schema and model for payouts collection
 */

const mongoose = require('mongoose');

/**
 * Payout Schema
 * Defines the structure of payouts in MongoDB
 */
const payoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    reason: {
      type: String,
      required: [true, 'Payout reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index for faster queries
payoutSchema.index({ userId: 1, createdAt: -1 });
payoutSchema.index({ status: 1 });

// Create and export Payout model
const Payout = mongoose.model('Payout', payoutSchema);

module.exports = Payout;

