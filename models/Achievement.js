const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Achievement title is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    required: [true, 'Date achieved is required'],
  },
  category: {
    type: String,
    enum: ['Hackathon', 'Competition', 'Certification', 'Academic', 'Other'],
    default: 'Other',
  }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', AchievementSchema);
