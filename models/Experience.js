const mongoose = require('mongoose');

const ExperienceSchema = new mongoose.Schema({
  role: {
    type: String,
    required: [true, 'Role/Designation is required'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Experience type is required'],
    enum: ['Internship', 'Full-time'],
    default: 'Internship',
  },
  duration: {
    type: String,
    required: [true, 'Duration is required (e.g., Jun 2024 - Aug 2024)'],
  },
  description: [{
    type: String, // Individual bullet points of experience detail
  }],
  order: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('Experience', ExperienceSchema);
