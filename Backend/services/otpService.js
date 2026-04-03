/**
 * OTP Service
 * Generates and verifies one-time passwords in memory.
 * No database is used here - each OTP lives for 2 minutes only.
 */

const crypto = require('crypto');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../utils/constants');

const OTP_TTL_MS = 2 * 60 * 1000;
const otpStore = new Map();

function normalizePhoneNumber(phone) {
  return String(phone || '').replace(/\D/g, '');
}

function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function clearStoredOtp(phone) {
  const existingEntry = otpStore.get(phone);

  if (existingEntry?.timer) {
    clearTimeout(existingEntry.timer);
  }

  otpStore.delete(phone);
}

function requestOtp(phone) {
  const normalizedPhone = normalizePhoneNumber(phone);

  if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
    const error = new Error(ERROR_MESSAGES.INVALID_PHONE);
    error.statusCode = 400;
    throw error;
  }

  clearStoredOtp(normalizedPhone);

  const otp = generateOtpCode();
  const expiresAt = Date.now() + OTP_TTL_MS;

  const timer = setTimeout(() => {
    otpStore.delete(normalizedPhone);
  }, OTP_TTL_MS);

  if (typeof timer.unref === 'function') {
    timer.unref();
  }

  otpStore.set(normalizedPhone, {
    otp,
    expiresAt,
    timer,
  });

  // Show the OTP in the server console for local testing instead of SMS.
  console.log(`[GigShield OTP] ${normalizedPhone}: ${otp} (expires in 2 minutes)`);

  return {
    phone: normalizedPhone,
    expiresIn: 120,
    message: SUCCESS_MESSAGES.OTP_SENT,
  };
}

function verifyOtp(phone, otp) {
  const normalizedPhone = normalizePhoneNumber(phone);
  const storedEntry = otpStore.get(normalizedPhone);

  if (!storedEntry) {
    const error = new Error(ERROR_MESSAGES.OTP_EXPIRED);
    error.statusCode = 410;
    throw error;
  }

  if (Date.now() > storedEntry.expiresAt) {
    clearStoredOtp(normalizedPhone);

    const error = new Error(ERROR_MESSAGES.OTP_EXPIRED);
    error.statusCode = 410;
    throw error;
  }

  if (storedEntry.otp !== String(otp)) {
    const error = new Error(ERROR_MESSAGES.OTP_INVALID);
    error.statusCode = 400;
    throw error;
  }

  clearStoredOtp(normalizedPhone);

  return {
    phone: normalizedPhone,
    message: SUCCESS_MESSAGES.OTP_VERIFIED,
  };
}

module.exports = {
  requestOtp,
  verifyOtp,
  normalizePhoneNumber,
};