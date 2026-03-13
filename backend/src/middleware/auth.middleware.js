const { verifyAccessToken } = require('../utils/jwt');
const { ApiError } = require('../utils/apiResponse');
const User = require('../models/user.model');

const protect = async (req, res, next) => {
  try {
    // Extract token
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ApiError(401, 'Authentication required. Please log in.'));
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(new ApiError(401, 'Token expired. Please log in again.'));
      }
      return next(new ApiError(401, 'Invalid token. Please log in again.'));
    }

    // Find user
    const user = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!user) {
      return next(new ApiError(401, 'User no longer exists.'));
    }

    // Check if user is active
    if (!user.isActive) {
      return next(new ApiError(403, 'Account has been deactivated.'));
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAfter(decoded.iat)) {
      return next(new ApiError(401, 'Password recently changed. Please log in again.'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Role-based access control middleware factory
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return next(new ApiError(403, `Access denied. Required role: ${roles.join(' or ')}`));
    }
    next();
  };
};

module.exports = { protect, authorize };
