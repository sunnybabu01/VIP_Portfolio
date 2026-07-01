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
# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_jwt_token_for_sunny_ranjan_portfolio
SESSION_SECRET=another_super_secret_session_key

# Database Configuration
MONGODB_URI=mongodb+srv://sunny824118_db_user:dzknMfNwOznZVZ8y@cluster0.dsaxoct.mongodb.net/vip_portfolio

# Admin Credentials


# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dhd9nwxb7
CLOUDINARY_API_KEY=474982555587598
CLOUDINARY_API_SECRET=KFqNHQNDazB1UCJASym5jjI4szk

# Nodemailer Configuration
SMTP_HOST=sunny824118@gmail.com
SMTP_PORT=587
SMTP_USER=sunny824118@gmail.com
SMTP_PASS=tegvqhyusmiylvhw
CONTACT_RECEIVER_EMAIL=sunny824118@gmail.com

# Gemini AI API Configuration
GEMINI_API_KEY=AQ.Ab8RN6I1Av9yuigRvlCrrqvCQXJiVTOID1_OXFPdheXzkR-i1w


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
