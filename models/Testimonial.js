const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
  },
  feedback: {
    type: String,
    required: [true, 'Feedback description is required'],
  },
  designation: {
    type: String, // e.g. "CEO at TechCorp" or "Senior Architect"
    default: 'Professional Peer',
  },
  avatar: {
    type: String,
    default: '',
  },
  isApproved: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', TestimonialSchema);
