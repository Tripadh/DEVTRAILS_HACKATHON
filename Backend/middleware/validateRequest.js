/**
 * Request Validation Middleware
 * Validates incoming request data
 */

/**
 * Validate Required Fields
 * @param {array} requiredFields - Array of required field names
 * @returns {function} Middleware function
 */
const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Validate Email Format
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
const validateEmail = (req, res, next) => {
  const email = req.body.email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  next();
};

/**
 * Validate Password Strength
 * @param {object} req - Express request
 * @param {object} res - Express response
 * @param {function} next - Next middleware
 */
const validatePassword = (req, res, next) => {
  const password = req.body.password;

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long',
    });
  }

  next();
};

/**
 * Validate Phone Number
 * Keeps the OTP flow simple by accepting 10-15 digits after cleanup.
 */
const validatePhoneNumber = (req, res, next) => {
  const phone = String(req.body.phone || '').replace(/\D/g, '');

  if (phone.length < 10 || phone.length > 15) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid phone number',
    });
  }

  req.body.phone = phone;
  next();
};

/**
 * Validate OTP Format
 * OTP must be exactly 6 digits.
 */
const validateOtpCode = (req, res, next) => {
  const otp = String(req.body.otp || '').trim();

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({
      success: false,
      message: 'OTP must be a 6-digit code',
    });
  }

  req.body.otp = otp;
  next();
};

module.exports = {
  validateRequiredFields,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateOtpCode,
};
