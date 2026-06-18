const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const Blog = require('../models/Blog');
const Testimonial = require('../models/Testimonial');
const Message = require('../models/Message');
const Gallery = require('../models/Gallery');
const { sendEmail } = require('../config/mail');

// @desc    Render public portfolio home page
// @route   GET /
router.get('/', async (req, res, next) => {
  try {
    // Fetch all database records in parallel for optimal speed
    const [
      profile,
      skills,
      projects,
      experiences,
      certificates,
      achievements,
      blogs,
      testimonials
    ] = await Promise.all([
      Profile.findOne() || new Profile(),
      Skill.find().sort({ level: -1 }),
      Project.find({ featured: true }).limit(6), // show featured projects on home
      Experience.find().sort({ order: 1 }),
      Certificate.find().sort({ date: -1 }),
      Achievement.find().sort({ date: -1 }),
      Blog.find().sort({ createdAt: -1 }).limit(3), // recent 3 articles
      Testimonial.find({ isApproved: true })
    ]);

    res.render('public/index', {
      profile,
      skills,
      projects,
      experiences,
      certificates,
      achievements,
      blogs,
      testimonials,
      activePage: 'home'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Render projects page (Listing and filters)
// @route   GET /projects
router.get('/projects', async (req, res, next) => {
  const { category, search } = req.query;
  const filter = {};

  if (category && category !== 'All') {
    filter.category = category;
  }
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { technologies: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const [profile, projects] = await Promise.all([
      Profile.findOne(),
      Project.find(filter).sort({ createdAt: -1 })
    ]);

    res.render('public/projects', {
      profile,
      projects,
      selectedCategory: category || 'All',
      searchQuery: search || '',
      activePage: 'projects'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Render project detailed page & increment views
// @route   GET /projects/:id
router.get('/projects/:id', async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).render('404', { title: 'Project Not Found' });
    }

    // Increment view counter
    project.views += 1;
    await project.save();

    const profile = await Profile.findOne();

    res.render('public/project_detail', {
      profile,
      project,
      activePage: 'projects'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Render blogs list page
// @route   GET /blogs
router.get('/blogs', async (req, res, next) => {
  const { tag, search } = req.query;
  const filter = {};

  if (tag) {
    filter.tags = tag;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    const [profile, blogs] = await Promise.all([
      Profile.findOne(),
      Blog.find(filter).sort({ createdAt: -1 })
    ]);

    // Extract unique tags for filtering panel
    const allTags = await Blog.distinct('tags');

    res.render('public/blogs', {
      profile,
      blogs,
      tags: allTags,
      selectedTag: tag || '',
      searchQuery: search || '',
      activePage: 'blogs'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Render single blog details
// @route   GET /blogs/:slug
router.get('/blogs/:slug', async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).render('404', { title: 'Blog Post Not Found' });
    }

    const profile = await Profile.findOne();
    const relatedBlogs = await Blog.find({ slug: { $ne: blog.slug }, tags: { $in: blog.tags } }).limit(3);

    res.render('public/blog_detail', {
      profile,
      blog,
      relatedBlogs,
      activePage: 'blogs'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Handle contact message submission
// @route   POST /contact
router.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, and message' });
  }

  try {
    // Save to database
    const newMessage = await Message.create({
      name,
      email,
      subject: subject || 'Portfolio Contact Inquiry',
      message
    });

    // Send email notification to Admin
    const emailSubject = `New Portfolio Contact: "${subject || 'General inquiry'}" from ${name}`;
    const emailText = `Hello Sunny,\n\nYou have received a new message via your portfolio website contact form:\n\nSender Name: ${name}\nSender Email: ${email}\nSubject: ${subject || 'N/A'}\n\nMessage:\n${message}\n\nYou can review and reply to this message from your Admin CMS panel.`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-top: 0;">New Message Alert</h2>
        <p>You have received a new contact submission on your portfolio website.</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 6px 0; font-weight: bold; width: 120px;">Name:</td>
            <td>${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Email:</td>
            <td><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-weight: bold;">Subject:</td>
            <td>${subject || 'General Inquiry'}</td>
          </tr>
        </table>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #cbd5e1;">
          <p style="margin: 0; font-style: italic; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="font-size: 13px; color: #666; margin-top: 25px; border-top: 1px solid #eee; padding-top: 10px;">
          Manage messages from your <a href="${req.protocol}://${req.get('host')}/admin/messages" style="color: #2563eb;">CMS Dashboard</a>.
        </p>
      </div>
    `;

    // Fire & forget sendMail to prevent loading delays
    sendEmail({
      subject: emailSubject,
      text: emailText,
      html: emailHtml
    }).catch(err => console.error('SMTP notification trigger failed:', err));

    res.status(201).json({ success: true, message: 'Your message has been submitted successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database failed to save message: ' + error.message });
  }
});

// @desc    Render public gallery page
// @route   GET /gallery
router.get('/gallery', async (req, res, next) => {
  try {
    const [profile, galleryItems] = await Promise.all([
      Profile.findOne(),
      Gallery.find().sort({ createdAt: -1 })
    ]);
    res.render('public/gallery', {
      profile,
      galleryItems,
      activePage: 'gallery'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Handle public feedback submission
// @route   POST /feedback
router.post('/feedback', async (req, res) => {
  const { clientName, feedback, designation } = req.body;

  if (!clientName || !feedback) {
    return res.status(400).json({ success: false, message: 'Please provide author name and feedback' });
  }

  try {
    await Testimonial.create({
      clientName,
      feedback,
      designation: designation || 'Visitor',
      isApproved: false // Requires admin moderation
    });

    res.status(201).json({ success: true, message: 'Thank you! Your feedback has been submitted for approval.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save feedback: ' + error.message });
  }
});

module.exports = router;
