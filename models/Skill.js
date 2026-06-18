const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Skill category is required'],
    enum: ['Languages', 'Frontend', 'Backend', 'Database', 'Cloud', 'AI/ML', 'Tools'],
  },
  level: {
    type: Number,
    required: [true, 'Skill proficiency level (1-100) is required'],
    min: 1,
    max: 100,
  },
  icon: {
    type: String,
    default: 'fas fa-code', // Default fontawesome class
  }
}, { timestamps: true });

module.exports = mongoose.model('Skill', SkillSchema);
