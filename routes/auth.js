const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail, isMailConfigured } = require('../config/mail');
const { checkLoggedIn, protect } = require('../middleware/auth');

// JWT generation helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_token_for_sunny_ranjan_portfolio', {
    expiresIn: '24h',
  });
};

// @desc    Render login page
// @route   GET /admin/login
router.get('/login', checkLoggedIn, (req, res) => {
  res.render('admin/login', { error: null });
});

// @desc    Handle admin login
// @route   POST /admin/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please enter all fields' });
  }

  try {
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Create token
    const token = generateToken(user._id);

    // Save token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({ success: true, redirectUrl: '/admin/dashboard' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// @desc    Handle logout
// @route   GET /admin/logout
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/admin/login');
});

// @desc    Render forgot password request
// @route   GET /admin/forgot-password
router.get('/forgot-password', checkLoggedIn, (req, res) => {
  res.render('admin/forgot_password', { message: null, error: null });
});

// @desc    Handle forgot password submission
// @route   POST /admin/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email address not registered' });
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set expiry
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expiration to 1 hour
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
    await user.save();

    // Reset Link URL
    const resetUrl = `${req.protocol}://${req.get('host')}/admin/reset-password/${resetToken}`;
    
    // Send email
    const messageText = `You are receiving this email because you (or someone else) requested to reset the admin password for Sunny's Portfolio CMS. Please execute a PUT or POST request to:\n\n${resetUrl}\n\nThis link will expire in 1 hour. If you did not request this, please ignore this email.`;
    const messageHtml = `<p>You are receiving this email because you (or someone else) requested to reset the admin password for Sunny's Portfolio CMS.</p><p>Please click the link below to set a new password (valid for 1 hour):</p><p><a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p><p>If you did not request this, please ignore this email.</p>`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Request - Portfolio CMS',
        text: messageText,
        html: messageHtml
      });

      if (!isMailConfigured) {
        return res.json({ 
          success: true, 
          message: `SMTP not configured. Dev Reset Link: ${resetUrl}` 
        });
      }

      res.json({ success: true, message: 'Password reset link sent to your email.' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      res.status(500).json({ success: false, message: 'Failed to send reset email. ' + err.message });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// @desc    Render reset password page
// @route   GET /admin/reset-password/:token
router.get('/reset-password/:token', checkLoggedIn, async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.render('admin/login', { error: 'Password reset token is invalid or has expired.' });
    }

    res.render('admin/reset_password', { token: req.params.token, error: null });
  } catch (error) {
    res.render('admin/login', { error: 'Database error occurred: ' + error.message });
  }
});

// @desc    Handle reset password submission
// @route   POST /admin/reset-password/:token
router.post('/reset-password/:token', async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully. You can log in now.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// @desc    Handle change password (when logged in)
// @route   POST /admin/change-password
router.post('/change-password', protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please fill out all fields' });
  }

  try {
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is correct.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

module.exports = router;
