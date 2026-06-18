const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer = null;

const normalizeLocalPath = (p) => {
  if (!p || typeof p !== 'string') return p;
  // If it is an absolute or incorrect local path containing public/uploads or public\uploads
  if (p.includes('public') && (p.includes('\\') || p.includes('/'))) {
    const parts = p.split(/[\\/]/);
    const uploadsIdx = parts.indexOf('uploads');
    if (uploadsIdx !== -1) {
      return '/' + parts.slice(uploadsIdx).join('/');
    }
  }
  return p;
};

const normalizeAllPaths = async () => {
  try {
    console.log('Normalizing image and file paths in database...');
    
    // 1. Profile
    const Profile = require('../models/Profile');
    const profiles = await Profile.find();
    for (let p of profiles) {
      let changed = false;
      const nProfileImage = normalizeLocalPath(p.profileImage);
      const nResumePdf = normalizeLocalPath(p.resumePdf);
      const nHeroImage = normalizeLocalPath(p.heroImage);
      
      if (p.profileImage !== nProfileImage) { p.profileImage = nProfileImage; changed = true; }
      if (p.resumePdf !== nResumePdf) { p.resumePdf = nResumePdf; changed = true; }
      if (p.heroImage !== nHeroImage) { p.heroImage = nHeroImage; changed = true; }
      
      if (changed) await p.save();
    }

    // 2. Project
    const Project = require('../models/Project');
    const projects = await Project.find();
    for (let proj of projects) {
      if (proj.images && proj.images.length > 0) {
        const nImages = proj.images.map(normalizeLocalPath);
        let changed = false;
        for (let i = 0; i < proj.images.length; i++) {
          if (proj.images[i] !== nImages[i]) {
            changed = true;
            break;
          }
        }
        if (changed) {
          proj.images = nImages;
          await proj.save();
        }
      }
    }

    // 3. Certificate
    const Certificate = require('../models/Certificate');
    const certs = await Certificate.find();
    for (let c of certs) {
      let changed = false;
      const nImageUrl = normalizeLocalPath(c.imageUrl);
      const nPdfUrl = normalizeLocalPath(c.pdfUrl);
      
      if (c.imageUrl !== nImageUrl) { c.imageUrl = nImageUrl; changed = true; }
      if (c.pdfUrl !== nPdfUrl) { c.pdfUrl = nPdfUrl; changed = true; }
      
      if (changed) await c.save();
    }

    // 4. Testimonial
    const Testimonial = require('../models/Testimonial');
    const testimonials = await Testimonial.find();
    for (let t of testimonials) {
      const nAvatar = normalizeLocalPath(t.avatar);
      if (t.avatar !== nAvatar) {
        t.avatar = nAvatar;
        await t.save();
      }
    }

    // 5. Blog
    const Blog = require('../models/Blog');
    const blogs = await Blog.find();
    for (let b of blogs) {
      const nCoverImage = normalizeLocalPath(b.coverImage);
      if (b.coverImage !== nCoverImage) {
        b.coverImage = nCoverImage;
        await b.save();
      }
    }

    // 6. Gallery
    const Gallery = require('../models/Gallery');
    const galleryItems = await Gallery.find();
    for (let g of galleryItems) {
      const nImageUrl = normalizeLocalPath(g.imageUrl);
      if (g.imageUrl !== nImageUrl) {
        g.imageUrl = nImageUrl;
        await g.save();
      }
    }
    
    console.log('Database paths normalization completed.');
  } catch (err) {
    console.error('Error during path normalization:', err);
  }
};

const connectDB = async () => {
  try {
    const defaultUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vip_portfolio';
    let conn;
    
    try {
      console.log('Attempting to connect to MongoDB server...');
      conn = await mongoose.connect(defaultUri, {
        serverSelectionTimeoutMS: 3000 // 3 seconds timeout for fallback
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
      if (process.env.NODE_ENV === 'development' || !process.env.MONGODB_URI) {
        console.warn(`Local MongoDB connection failed: ${err.message}. Starting in-memory MongoDB server...`);
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        process.env.MONGODB_URI = mongoUri;
        conn = await mongoose.connect(mongoUri);
        console.log(`In-memory MongoDB Connected: ${conn.connection.host}`);
      } else {
        throw err;
      }
    }

    // Check if database needs seeding
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('No users found in database. Automatically seeding data...');
      const seedData = require('../scripts/seed');
      await seedData(false); // Do not close connection after seeding
    } else {
      await normalizeAllPaths();
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
