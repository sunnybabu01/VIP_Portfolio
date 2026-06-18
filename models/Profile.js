const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  college: { type: String, required: true },
  duration: { type: String, required: true }, // e.g. "2023 - 2027"
  score: { type: String } // e.g. "CGPA: 8.5" or "Percentage: 85%"
});

const ProfileSchema = new mongoose.Schema({
  // Profile Information
  name: { type: String, default: 'Sunny Ranjan' },
  designation: { type: String, default: 'Software Developer' },
  bio: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  resumePdf: { type: String, default: '' },
  email: { type: String, default: 'sunny824118@gmail.com' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },

  // Social Connections
  socialLinks: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    leetcode: { type: String, default: '' },
    hackerrank: { type: String, default: '' },
    codechef: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' }
  },

  // Hero Section Settings
  heroTitle: { type: String, default: 'Hi, I am Sunny Ranjan' },
  heroSubtitle: { type: String, default: 'Software Developer' },
  heroDescription: { type: String, default: 'Crafting responsive, high-performance web applications and solving complex algorithmic challenges.' },
  heroImage: { type: String, default: '' },
  resumeButtonText: { type: String, default: 'Download Resume' },
  ctaButtonText: { type: String, default: 'Get In Touch' },
  ctaButtonLink: { type: String, default: '#contact' },

  // About Section Settings
  aboutText: { type: String, default: '' },
  careerObjective: { type: String, default: '' },
  education: [EducationSchema]
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
