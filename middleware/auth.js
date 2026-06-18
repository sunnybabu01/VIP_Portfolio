const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token in cookies
const protect = async (req, res, next) => {
  let token;

  // Retrieve token from cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this API endpoint' });
    }
    return res.redirect('/admin/login');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_token_for_sunny_ranjan_portfolio');

    // Find the user and attach to request
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      res.clearCookie('token');
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(401).json({ success: false, message: 'User not found, authentication failed' });
      }
      return res.redirect('/admin/login');
    }
    
    // Set user as local variable for all templates (EJS views have access)
    res.locals.user = req.user;
    next();
  } catch (error) {
    res.clearCookie('token');
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.status(401).json({ success: false, message: 'Invalid token, authorization failed' });
    }
    return res.redirect('/admin/login');
  }
};

// Optional: Middleware to check if user is already logged in (redirect from login page to dashboard)
const checkLoggedIn = (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_token_for_sunny_ranjan_portfolio');
      return res.redirect('/admin/dashboard');
    } catch (err) {
      res.clearCookie('token');
    }
  }
  next();
};

module.exports = { protect, checkLoggedIn };
