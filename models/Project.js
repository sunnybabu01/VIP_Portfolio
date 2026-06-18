const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
  },
  images: [{
    type: String, // URLs of project images
  }],
  githubLink: {
    type: String,
    default: '',
  },
  liveLink: {
    type: String,
    default: '',
  },
  technologies: [{
    type: String, // e.g., ["React", "Node.js", "MongoDB"]
  }],
  category: {
    type: String,
    required: [true, 'Project category is required'],
    enum: ['Web Development', 'Mobile Apps', 'AI Projects', 'Full Stack', 'Data Science'],
  },
  views: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
