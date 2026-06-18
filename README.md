# VIP Portfolio CMS

A professional, responsive, and SEO-optimized Full-Stack Developer Portfolio website with a built-in CMS administration panel.

## Features

- **Dynamic Homepage**: Showcases career objectives, education timelines, custom skills, experience logs, certifications, and recent blog posts.
- **Admin CMS Dashboard**: Fully responsive panel to add, edit, or delete skills, projects, certifications, experiences, and achievements.
- **Photo Gallery**: Admin-managed image gallery with responsive card grid layouts.
- **Visitor Testimonial System**: Let visitors write feedback and reviews directly from the homepage with a built-in admin approval moderation pipeline.
- **Ask Sunny Chatbot**: An AI digital twin representation built with Gemini AI (falls back to local rules-based assistant if API key is unconfigured).
- **Email Contact System**: Contact form submissions are saved in the database and immediately dispatched to the admin via Gmail SMTP/Nodemailer.
- **Nodemon Hot-Reload**: Custom configurations to ignore uploaded assets to avoid unexpected session logouts during edits.

## Tech Stack

- **Frontend**: EJS (Embedded JavaScript templates), Tailwind CSS, FontAwesome, JavaScript (Vanilla AJAX / Intersections API)
- **Backend**: Node.js, Express.js, Nodemailer, Multer
- **Database**: MongoDB (Mongoose ODM)
- **AI Integration**: Google GenAI SDK (Gemini API)

---

## Setup & Installation

### 1. Prerequisites
Ensure you have node.js (>= 18.0.0) and npm installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and populate it:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
SESSION_SECRET=your_session_secret_key

# Database Connection (MongoDB Atlas)
MONGODB_URI=your_mongodb_connection_string

# Nodemailer Configuration (Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
CONTACT_RECEIVER_EMAIL=your_email@gmail.com

# Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Seed Database
Seeding the database will create default portfolio records and set up your default admin login credentials:
```bash
npm run seed
```

### 5. Run Locally
```bash
npm run dev
```
Open [http://localhost:5000](http://localhost:5000) in your browser.
