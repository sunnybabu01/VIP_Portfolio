require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const trackVisitor = require('./middleware/analytics');

// Initialize Express
const app = express();

// Connect to MongoDB Database
connectDB();

// Setup EJS View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Core Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static Files Scaffolding (stylesheets, client scripts, uploads)
app.use(express.static(path.join(__dirname, 'public')));

// Global Visitor Analytics Middleware
app.use(trackVisitor);

// Route Bindings
const publicRouter = require('./routes/public');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');

// Map base routes
app.use('/', publicRouter);
app.use('/admin', authRouter);
app.use('/admin', adminRouter);
app.use('/api', apiRouter);

// Root Admin redirect trigger (redirect /admin directly to /admin/dashboard)
app.get('/admin', (req, res) => {
  res.redirect('/admin/dashboard');
});

// Custom 404 Error handler (page not found)
app.use((req, res, next) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// Global Exception error handler
app.use((err, req, res, next) => {
  console.error('SERVER FATAL EXCEPTION:', err.stack);
  res.status(500).render('404', { 
    title: 'Server Error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'A serious server-side transaction exception occurred.'
  });
});

// Start Server Listeners
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server executing in ${process.env.NODE_ENV || 'development'} mode.`);
  console.log(`Local Website URL: http://localhost:${PORT}`);
});
