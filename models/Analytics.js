const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  ip: {
    type: String,
    default: '127.0.0.1',
  },
  country: {
    type: String,
    default: 'Localhost',
  },
  path: {
    type: String,
    default: '/',
  },
  userAgent: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  }
});

// Compound index on date and path for efficient analytics aggregates
AnalyticsSchema.index({ date: 1, path: 1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
