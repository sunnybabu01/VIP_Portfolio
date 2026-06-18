const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Certificate name is required'],
    trim: true,
  },
  imageUrl: {
    type: String, // Thumbnail / Badge Image URL
    default: '',
  },
  pdfUrl: {
    type: String, // Downloadable certificate file PDF URL
    default: '',
  },
  credentialUrl: {
    type: String, // Verification link
    default: '',
  },
  date: {
    type: Date,
    required: [true, 'Issue date is required'],
  }
}, { timestamps: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
