const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
  },
  coverImage: {
    type: String,
    default: '',
  },
  tags: [{
    type: String,
    trim: true,
  }]
}, { timestamps: true });

// Pre-validate hook to auto-generate slug if not present (defensive)
BlogSchema.pre('validate', function(next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')       // Replace spaces with -
      .replace(/[^\w\-]+/g, '')   // Remove all non-word chars
      .replace(/\-\-+/g, '-')     // Replace multiple - with single -
      .replace(/^-+/, '')         // Trim - from start
      .replace(/-+$/, '');        // Trim - from end
  }
  next();
});

module.exports = mongoose.model('Blog', BlogSchema);
