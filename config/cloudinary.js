const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure local upload folder exists for fallback
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

let storage;
let isCloudinaryConfigured = false;

// Check if Cloudinary is configured
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const folder = 'sunny_portfolio';
      // Determine format/resource_type
      const ext = path.extname(file.originalname).toLowerCase();
      let resource_type = 'image';
      
      if (ext === '.pdf') {
        resource_type = 'raw';
      }

      return {
        folder: folder,
        resource_type: resource_type,
        public_id: `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9]/g, '_')}`,
      };
    },
  });
  
  isCloudinaryConfigured = true;
  console.log('Cloudinary storage engine configured.');
} else {
  // Local storage fallback
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
    },
  });
  console.log('Local storage fallback engine configured (Cloudinary env keys missing).');
}

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp|gif|pdf/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpeg, jpg, png, webp, gif) and PDF documents are allowed!'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

module.exports = {
  upload,
  cloudinary,
  isCloudinaryConfigured,
};
