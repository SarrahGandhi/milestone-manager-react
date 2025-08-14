const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid.",
      });
    }

    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated.",
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      // No token provided, continue as public access
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user && user.isActive !== false) {
        req.user = user;
      } else {
        req.user = null;
      }
    } catch (error) {
      // Invalid token, continue as public access
      req.user = null;
    }

    next();
  } catch (error) {
    // Any other error, continue as public access
    console.error("Optional auth error:", error);
    req.user = null;
    next();
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
};

module.exports = {
  authenticateToken,
  protect: authenticateToken,
  requireAdmin,
  adminOnly: requireAdmin,
  optionalAuth,
};
