const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, isCloudinaryConfigured } = require('../config/cloudinary');

// Import all models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const Blog = require('../models/Blog');
const Testimonial = require('../models/Testimonial');
const Message = require('../models/Message');
const Analytics = require('../models/Analytics');
const Gallery = require('../models/Gallery');

// Helper to extract file path from request (supporting both Cloudinary and local uploads)
const getUploadedFilePath = (file) => {
  if (!file) return null;
  // If uploaded to Cloudinary, path is in path or secure_url
  // If uploaded locally, filename is in filename and we map to /uploads/filename
  return isCloudinaryConfigured ? file.path : `/uploads/${file.filename}`;
};

// ==========================================
// 1. DASHBOARD & ANALYTICS VIEWS
// ==========================================

// @desc    Render admin dashboard with metric cards and recent activities
// @route   GET /admin/dashboard
router.get('/dashboard', protect, async (req, res, next) => {
  try {
    const [
      totalProjects,
      totalSkills,
      totalCertificates,
      totalMessages,
      totalVisitors,
      recentActivities,
      profile
    ] = await Promise.all([
      Project.countDocuments(),
      Skill.countDocuments(),
      Certificate.countDocuments(),
      Message.countDocuments(),
      Analytics.countDocuments(),
      Message.find().sort({ createdAt: -1 }).limit(5), // recent 5 messages represent activities
      Profile.findOne()
    ]);

    res.render('admin/dashboard', {
      totalProjects,
      totalSkills,
      totalCertificates,
      totalMessages,
      totalVisitors,
      recentActivities,
      profile,
      activeTab: 'dashboard'
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 2. PROFILE & HERO MANAGEMENT
// ==========================================

// @desc    Render profile & hero edit interface
// @route   GET /admin/profile
router.get('/profile', protect, async (req, res, next) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({});
    }
    res.render('admin/profile', { profile, activeTab: 'profile', success: null, error: null });
  } catch (error) {
    next(error);
  }
});

// @desc    Update basic profile details and profile images/resumes
// @route   POST /admin/profile
router.post('/profile', protect, upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resumePdf', maxCount: 1 }
]), async (req, res) => {
  try {
    const profile = await Profile.findOne() || new Profile();
    
    // Update basic details
    profile.name = req.body.name || profile.name;
    profile.designation = req.body.designation || profile.designation;
    profile.bio = req.body.bio || profile.bio;
    profile.email = req.body.email || profile.email;
    profile.phone = req.body.phone || profile.phone;
    profile.address = req.body.address || profile.address;
    profile.aboutText = req.body.aboutText || profile.aboutText;
    profile.careerObjective = req.body.careerObjective || profile.careerObjective;

    // Check files uploads
    if (req.files) {
      if (req.files.profileImage) {
        profile.profileImage = getUploadedFilePath(req.files.profileImage[0]);
      }
      if (req.files.resumePdf) {
        profile.resumePdf = getUploadedFilePath(req.files.resumePdf[0]);
      }
    }

    await profile.save();
    res.redirect('/admin/profile?success=Profile updated successfully!');
  } catch (error) {
    res.redirect(`/admin/profile?error=${encodeURIComponent(error.message)}`);
  }
});

// @desc    Update profile social hyperlinks
// @route   POST /admin/profile/socials
router.post('/profile/socials', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne() || new Profile();
    profile.socialLinks = {
      github: req.body.github || '',
      linkedin: req.body.linkedin || '',
      leetcode: req.body.leetcode || '',
      hackerrank: req.body.hackerrank || '',
      codechef: req.body.codechef || '',
      twitter: req.body.twitter || '',
      instagram: req.body.instagram || ''
    };
    await profile.save();
    res.redirect('/admin/profile?success=Social links updated successfully!');
  } catch (error) {
    res.redirect(`/admin/profile?error=${encodeURIComponent(error.message)}`);
  }
});

// @desc    Update profile education list
// @route   POST /admin/profile/education
router.post('/profile/education', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne() || new Profile();
    
    const educationList = [];
    // Handle form array values
    if (req.body.degree) {
      if (Array.isArray(req.body.degree)) {
        for (let i = 0; i < req.body.degree.length; i++) {
          if (req.body.degree[i]) {
            educationList.push({
              degree: req.body.degree[i],
              college: req.body.college[i],
              duration: req.body.duration[i],
              score: req.body.score[i]
            });
          }
        }
      } else {
        educationList.push({
          degree: req.body.degree,
          college: req.body.college,
          duration: req.body.duration,
          score: req.body.score
        });
      }
    }
    
    profile.education = educationList;
    await profile.save();
    res.redirect('/admin/profile?success=Education timeline updated successfully!');
  } catch (error) {
    res.redirect(`/admin/profile?error=${encodeURIComponent(error.message)}`);
  }
});

// @desc    Update Hero section settings
// @route   POST /admin/profile/hero
router.post('/profile/hero', protect, upload.single('heroImage'), async (req, res) => {
  try {
    const profile = await Profile.findOne() || new Profile();
    
    profile.heroTitle = req.body.heroTitle || profile.heroTitle;
    profile.heroSubtitle = req.body.heroSubtitle || profile.heroSubtitle;
    profile.heroDescription = req.body.heroDescription || profile.heroDescription;
    profile.resumeButtonText = req.body.resumeButtonText || profile.resumeButtonText;
    profile.ctaButtonText = req.body.ctaButtonText || profile.ctaButtonText;
    profile.ctaButtonLink = req.body.ctaButtonLink || profile.ctaButtonLink;

    if (req.file) {
      profile.heroImage = getUploadedFilePath(req.file);
    }

    await profile.save();
    res.redirect('/admin/profile?success=Hero section updated successfully!');
  } catch (error) {
    res.redirect(`/admin/profile?error=${encodeURIComponent(error.message)}`);
  }
});

// ==========================================
// 3. SKILLS MANAGEMENT
// ==========================================

// @desc    Get skills CRUD list
// @route   GET /admin/skills
router.get('/skills', protect, async (req, res, next) => {
  try {
    const skills = await Skill.find().sort({ category: 1, level: -1 });
    const profile = await Profile.findOne();
    res.render('admin/skills', { skills, profile, activeTab: 'skills' });
  } catch (error) {
    next(error);
  }
});

// @desc    Add new skill
// @route   POST /admin/skills
router.post('/skills', protect, async (req, res) => {
  try {
    const { name, category, level, icon } = req.body;
    await Skill.create({ name, category, level: parseInt(level), icon });
    res.redirect('/admin/skills');
  } catch (error) {
    res.status(500).send('Skill creation failed: ' + error.message);
  }
});

// @desc    Edit existing skill
// @route   POST /admin/skills/:id/edit
router.post('/skills/:id/edit', protect, async (req, res) => {
  try {
    const { name, category, level, icon } = req.body;
    await Skill.findByIdAndUpdate(req.params.id, {
      name,
      category,
      level: parseInt(level),
      icon
    });
    res.redirect('/admin/skills');
  } catch (error) {
    res.status(500).send('Skill edit failed: ' + error.message);
  }
});

// @desc    Delete skill
// @route   POST /admin/skills/:id/delete
router.post('/skills/:id/delete', protect, async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.redirect('/admin/skills');
  } catch (error) {
    res.status(500).send('Skill delete failed: ' + error.message);
  }
});

// ==========================================
// 4. PROJECTS MANAGEMENT
// ==========================================

// @desc    Get projects CRUD list
// @route   GET /admin/projects
router.get('/projects', protect, async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    const profile = await Profile.findOne();
    res.render('admin/projects', { projects, profile, activeTab: 'projects' });
  } catch (error) {
    next(error);
  }
});

// @desc    Add new project
// @route   POST /admin/projects
router.post('/projects', protect, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, githubLink, liveLink, category, featured } = req.body;
    
    // Parse technologies array
    const technologies = req.body.technologies 
      ? req.body.technologies.split(',').map(tech => tech.trim()).filter(Boolean)
      : [];

    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(getUploadedFilePath(file));
      });
    }

    await Project.create({
      title,
      description,
      githubLink,
      liveLink,
      category,
      technologies,
      images,
      featured: featured === 'true'
    });

    res.redirect('/admin/projects');
  } catch (error) {
    res.status(500).send('Project creation failed: ' + error.message);
  }
});

// @desc    Edit existing project
// @route   POST /admin/projects/:id/edit
router.post('/projects/:id/edit', protect, upload.array('images', 5), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).send('Project not found');

    const { title, description, githubLink, liveLink, category, featured } = req.body;
    
    project.title = title || project.title;
    project.description = description || project.description;
    project.githubLink = githubLink !== undefined ? githubLink : project.githubLink;
    project.liveLink = liveLink !== undefined ? liveLink : project.liveLink;
    project.category = category || project.category;
    project.featured = featured === 'true';

    if (req.body.technologies) {
      project.technologies = req.body.technologies.split(',').map(tech => tech.trim()).filter(Boolean);
    }

    // Append newly uploaded images
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        project.images.push(getUploadedFilePath(file));
      });
    }

    // Support image deletions
    if (req.body.deleteImages) {
      const deleteList = Array.isArray(req.body.deleteImages) ? req.body.deleteImages : [req.body.deleteImages];
      project.images = project.images.filter(img => !deleteList.includes(img));
    }

    await project.save();
    res.redirect('/admin/projects');
  } catch (error) {
    res.status(500).send('Project update failed: ' + error.message);
  }
});

// @desc    Delete project
// @route   POST /admin/projects/:id/delete
router.post('/projects/:id/delete', protect, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.redirect('/admin/projects');
  } catch (error) {
    res.status(500).send('Project deletion failed: ' + error.message);
  }
});

// ==========================================
// 5. EXPERIENCE MANAGEMENT
// ==========================================

// @desc    Get experience manager
// @route   GET /admin/experience
router.get('/experience', protect, async (req, res, next) => {
  try {
    const experiences = await Experience.find().sort({ order: 1 });
    const profile = await Profile.findOne();
    res.render('admin/experience', { experiences, profile, activeTab: 'experience' });
  } catch (error) {
    next(error);
  }
});

// @desc    Add new experience
// @route   POST /admin/experience
router.post('/experience', protect, async (req, res) => {
  try {
    const { role, company, type, duration, order } = req.body;
    
    // Parse description points
    const description = req.body.description
      ? req.body.description.split('\n').map(pt => pt.trim()).filter(Boolean)
      : [];

    await Experience.create({
      role,
      company,
      type,
      duration,
      description,
      order: parseInt(order) || 0
    });

    res.redirect('/admin/experience');
  } catch (error) {
    res.status(500).send('Experience create failed: ' + error.message);
  }
});

// @desc    Edit existing experience
// @route   POST /admin/experience/:id/edit
router.post('/admin/experience/:id/edit', protect, async (req, res) => {
  try {
    const { role, company, type, duration, order } = req.body;
    const description = req.body.description
      ? req.body.description.split('\n').map(pt => pt.trim()).filter(Boolean)
      : [];

    await Experience.findByIdAndUpdate(req.params.id, {
      role,
      company,
      type,
      duration,
      description,
      order: parseInt(order) || 0
    });

    res.redirect('/admin/experience');
  } catch (error) {
    res.status(500).send('Experience edit failed: ' + error.message);
  }
});

// @desc    Delete experience
// @route   POST /admin/experience/:id/delete
router.post('/experience/:id/delete', protect, async (req, res) => {
  try {
    await Experience.findByIdAndDelete(req.params.id);
    res.redirect('/admin/experience');
  } catch (error) {
    res.status(500).send('Experience delete failed: ' + error.message);
  }
});

// ==========================================
// 6. CERTIFICATIONS MANAGEMENT
// ==========================================

// @desc    Get certificates manager
// @route   GET /admin/certificates
router.get('/certificates', protect, async (req, res, next) => {
  try {
    const certificates = await Certificate.find().sort({ date: -1 });
    const profile = await Profile.findOne();
    res.render('admin/certificates', { certificates, profile, activeTab: 'certificates' });
  } catch (error) {
    next(error);
  }
});

// @desc    Add certificate
// @route   POST /admin/certificates
router.post('/certificates', protect, upload.fields([
  { name: 'imageUrl', maxCount: 1 },
  { name: 'pdfUrl', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, credentialUrl, date } = req.body;
    let imageUrl = '';
    let pdfUrl = '';

    if (req.files) {
      if (req.files.imageUrl) imageUrl = getUploadedFilePath(req.files.imageUrl[0]);
      if (req.files.pdfUrl) pdfUrl = getUploadedFilePath(req.files.pdfUrl[0]);
    }

    await Certificate.create({
      name,
      credentialUrl,
      imageUrl,
      pdfUrl,
      date: new Date(date)
    });

    res.redirect('/admin/certificates');
  } catch (error) {
    res.status(500).send('Certificate upload failed: ' + error.message);
  }
});

// @desc    Delete certificate
// @route   POST /admin/certificates/:id/delete
router.post('/certificates/:id/delete', protect, async (req, res) => {
  try {
    await Certificate.findByIdAndDelete(req.params.id);
    res.redirect('/admin/certificates');
  } catch (error) {
    res.status(500).send('Certificate delete failed: ' + error.message);
  }
});

// ==========================================
// 7. ACHIEVEMENTS MANAGEMENT
// ==========================================

// @desc    Get achievements manager
// @route   GET /admin/achievements
router.get('/achievements', protect, async (req, res, next) => {
  try {
    const achievements = await Achievement.find().sort({ date: -1 });
    const profile = await Profile.findOne();
    res.render('admin/achievements', { achievements, profile, activeTab: 'achievements' });
  } catch (error) {
    next(error);
  }
});

// @desc    Add achievement
// @route   POST /admin/achievements
router.post('/achievements', protect, async (req, res) => {
  try {
    const { title, description, date, category } = req.body;
    await Achievement.create({
      title,
      description,
      date: new Date(date),
      category
    });
    res.redirect('/admin/achievements');
  } catch (error) {
    res.status(500).send('Achievement creation failed: ' + error.message);
  }
});

// @desc    Delete achievement
// @route   POST /admin/achievements/:id/delete
router.post('/achievements/:id/delete', protect, async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(req.params.id);
    res.redirect('/admin/achievements');
  } catch (error) {
    res.status(500).send('Achievement delete failed: ' + error.message);
  }
});

// ==========================================
// 8. BLOG MANAGEMENT
// ==========================================

// @desc    Get blogs editor manager
// @route   GET /admin/blogs
router.get('/blogs', protect, async (req, res, next) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    const profile = await Profile.findOne();
    res.render('admin/blogs', { blogs, profile, activeTab: 'blogs' });
  } catch (error) {
    next(error);
  }
});

// @desc    Create new blog post
// @route   POST /admin/blogs
router.post('/blogs', protect, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const tags = req.body.tags 
      ? req.body.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    let coverImage = '';
    if (req.file) {
      coverImage = getUploadedFilePath(req.file);
    }

    await Blog.create({
      title,
      content,
      coverImage,
      tags
    });

    res.redirect('/admin/blogs');
  } catch (error) {
    res.status(500).send('Blog posting failed: ' + error.message);
  }
});

// @desc    Delete blog post
// @route   POST /admin/blogs/:id/delete
router.post('/blogs/:id/delete', protect, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.redirect('/admin/blogs');
  } catch (error) {
    res.status(500).send('Blog delete failed: ' + error.message);
  }
});

// ==========================================
// 9. TESTIMONIALS MANAGEMENT
// ==========================================

// @desc    Get client testimonials list
// @route   GET /admin/testimonials
router.get('/testimonials', protect, async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    const profile = await Profile.findOne();
    res.render('admin/testimonials', { testimonials, profile, activeTab: 'testimonials' });
  } catch (error) {
    next(error);
  }
});

// @desc    Create feedback card
// @route   POST /admin/testimonials
router.post('/testimonials', protect, upload.single('avatar'), async (req, res) => {
  try {
    const { clientName, feedback, designation } = req.body;
    let avatar = '';
    if (req.file) {
      avatar = getUploadedFilePath(req.file);
    }

    await Testimonial.create({
      clientName,
      feedback,
      designation,
      avatar,
      isApproved: true
    });

    res.redirect('/admin/testimonials');
  } catch (error) {
    res.status(500).send('Testimonial creation failed: ' + error.message);
  }
});

// @desc    Approve testimonial
// @route   POST /admin/testimonials/:id/approve
router.post('/testimonials/:id/approve', protect, async (req, res) => {
  try {
    await Testimonial.findByIdAndUpdate(req.params.id, { isApproved: true });
    res.redirect('/admin/testimonials');
  } catch (error) {
    res.status(500).send('Testimonial approval failed: ' + error.message);
  }
});

// @desc    Delete testimonial
// @route   POST /admin/testimonials/:id/delete
router.post('/testimonials/:id/delete', protect, async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.redirect('/admin/testimonials');
  } catch (error) {
    res.status(500).send('Testimonial deletion failed: ' + error.message);
  }
});

// ==========================================
// 10. MESSAGES (INBOX) MANAGEMENT
// ==========================================

// @desc    Get contacts message list
// @route   GET /admin/messages
router.get('/messages', protect, async (req, res, next) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    const profile = await Profile.findOne();
    res.render('admin/messages', { messages, profile, activeTab: 'messages' });
  } catch (error) {
    next(error);
  }
});

// @desc    Mark contact message as read
// @route   POST /admin/messages/:id/read
router.post('/messages/:id/read', protect, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Delete contact message
// @route   POST /admin/messages/:id/delete
router.post('/messages/:id/delete', protect, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.redirect('/admin/messages');
  } catch (error) {
    res.status(500).send('Message delete failed: ' + error.message);
  }
});

// ==========================================
// 11. GALLERY MANAGEMENT
// ==========================================

// @desc    Get gallery images list
// @route   GET /admin/gallery
router.get('/gallery', protect, async (req, res, next) => {
  try {
    const galleryItems = await Gallery.find().sort({ createdAt: -1 });
    const profile = await Profile.findOne();
    res.render('admin/gallery', { galleryItems, profile, activeTab: 'gallery' });
  } catch (error) {
    next(error);
  }
});

// @desc    Add new gallery image
// @route   POST /admin/gallery
router.post('/gallery', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!req.file) {
      return res.status(400).send('Please upload an image.');
    }
    
    const imageUrl = getUploadedFilePath(req.file);
    await Gallery.create({
      title,
      description,
      imageUrl
    });

    res.redirect('/admin/gallery');
  } catch (error) {
    res.status(500).send('Gallery creation failed: ' + error.message);
  }
});

// @desc    Edit existing gallery image details
// @route   POST /admin/gallery/:id/edit
router.post('/gallery/:id/edit', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const galleryItem = await Gallery.findById(req.params.id);
    if (!galleryItem) return res.status(404).send('Gallery item not found');

    galleryItem.title = title || galleryItem.title;
    galleryItem.description = description || galleryItem.description;

    if (req.file) {
      galleryItem.imageUrl = getUploadedFilePath(req.file);
    }

    await galleryItem.save();
    res.redirect('/admin/gallery');
  } catch (error) {
    res.status(500).send('Gallery edit failed: ' + error.message);
  }
});

// @desc    Delete gallery image
// @route   POST /admin/gallery/:id/delete
router.post('/gallery/:id/delete', protect, async (req, res) => {
  try {
    await Gallery.findByIdAndDelete(req.params.id);
    res.redirect('/admin/gallery');
  } catch (error) {
    res.status(500).send('Gallery deletion failed: ' + error.message);
  }
});

module.exports = router;
