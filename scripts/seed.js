require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Profile = require('../models/Profile');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const Blog = require('../models/Blog');
const Testimonial = require('../models/Testimonial');
const Analytics = require('../models/Analytics');

const seedData = async (shouldClose = true) => {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vip_portfolio');
      console.log(`Connected to database for seeding: ${conn.connection.host}`);
    }

    // Clear all existing data
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Skill.deleteMany({});
    await Project.deleteMany({});
    await Experience.deleteMany({});
    await Certificate.deleteMany({});
    await Achievement.deleteMany({});
    await Blog.deleteMany({});
    await Testimonial.deleteMany({});
    await Analytics.deleteMany({});
    console.log('Cleared existing database collections.');

    // 1. Seed Admin User
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'sunny824118@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123';

    const admin = await User.create({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
    });
    console.log('Seed: Created Admin User successfully.');

    // 2. Seed Profile
    const profile = await Profile.create({
      name: 'Sunny Ranjan',
      designation: 'Software Developer & AI Enthusiast',
      bio: 'B.Tech CSIT Student at Sagar Institute of Research and Technology (SIRT), passionate about full-stack development, software engineering, and artificial intelligence.',
      profileImage: '/images/profile-placeholder.jpg',
      resumePdf: '#',
      email: 'sunny824118@gmail.com',
      phone: '+91 9117461058',
      address: 'Bhopal, Madhya Pradesh, India',
      socialLinks: {
        github: 'https://github.com',
        linkedin: 'https://linkedin.com',
        leetcode: 'https://leetcode.com',
        hackerrank: 'https://hackerrank.com',
        codechef: 'https://codechef.com',
        twitter: 'https://twitter.com',
        instagram: 'https://instagram.com'
      },
      heroTitle: 'Hi, I am Sunny Ranjan',
      heroSubtitle: 'Software Developer',
      heroDescription: 'Building high-performance full-stack applications, exploring AI/ML landscapes, and solving complex problems with code. Welcome to my CMS portfolio!',
      heroImage: '/images/hero-placeholder.jpg',
      resumeButtonText: 'Download Resume',
      ctaButtonText: 'Hire Me',
      ctaButtonLink: '#contact',
      aboutText: 'I am a highly motivated B.Tech CSIT (2023-2027) student at SIRT. I specialize in backend architecture, databases, and frontend interfaces. My target is to design scalable, clean software and integrate artificial intelligence to solve real-world industrial challenges.',
      careerObjective: 'To leverage my coding skills, full-stack technologies knowledge, and AI expertise in a challenging software development role to create high-impact products and grow as a software engineer.',
      education: [
        {
          degree: 'B.Tech in Computer Science & Information Technology (CSIT)',
          college: 'Sagar Institute of Research and Technology (SIRT), Bhopal',
          duration: '2023 - 2027',
          score: 'CGPA: 8.4 (Ongoing)'
        },
        {
          degree: 'Higher Secondary School (Class XII)',
          college: 'CBSE Affiliated School',
          duration: '2021 - 2023',
          score: 'Percentage: 88%'
        }
      ]
    });
    console.log('Seed: Created Profile successfully.');

    // 3. Seed Skills
    const skillsList = [
      { name: 'Java', category: 'Languages', level: 85, icon: 'fab fa-java text-red-500' },
      { name: 'Python', category: 'Languages', level: 80, icon: 'fab fa-python text-blue-500' },
      { name: 'JavaScript', category: 'Languages', level: 90, icon: 'fab fa-js text-yellow-500' },
      { name: 'TypeScript', category: 'Languages', level: 75, icon: 'fas fa-file-code text-blue-400' },
      { name: 'React.js', category: 'Frontend', level: 85, icon: 'fab fa-react text-cyan-400' },
      { name: 'Next.js', category: 'Frontend', level: 80, icon: 'fas fa-square text-black dark:text-white' },
      { name: 'Node.js', category: 'Backend', level: 85, icon: 'fab fa-node-js text-green-500' },
      { name: 'Express.js', category: 'Backend', level: 85, icon: 'fas fa-server text-gray-500' },
      { name: 'MongoDB', category: 'Database', level: 80, icon: 'fas fa-leaf text-green-600' },
      { name: 'MySQL', category: 'Database', level: 75, icon: 'fas fa-database text-blue-600' },
      { name: 'AWS', category: 'Cloud', level: 70, icon: 'fab fa-aws text-orange-500' },
      { name: 'Power BI', category: 'Tools', level: 75, icon: 'fas fa-chart-bar text-yellow-600' },
      { name: 'AI/ML', category: 'AI/ML', level: 70, icon: 'fas fa-brain text-purple-500' },
      { name: 'Git & GitHub', category: 'Tools', level: 85, icon: 'fab fa-github text-gray-800 dark:text-white' }
    ];
    await Skill.insertMany(skillsList);
    console.log('Seed: Created Skills successfully.');

    // 4. Seed Projects
    const projectsList = [
      {
        title: 'Crypto Detection (SIH Project)',
        description: 'An advanced blockchain and AI-driven platform for tracking illicit cryptocurrency transactions. Built with Next.js, Node.js, and Machine Learning models to identify scam patterns, wash trading, and address clustering.',
        images: ['/images/project1-placeholder.jpg'],
        githubLink: 'https://github.com',
        liveLink: 'https://demo.com',
        technologies: ['Next.js', 'Node.js', 'MongoDB', 'Python', 'Machine Learning', 'Tailwind CSS'],
        category: 'AI Projects',
        views: 120,
        featured: true
      },
      {
        title: 'Snapcart E-Commerce Platform',
        description: 'A complete full-stack e-commerce marketplace featuring user authentication, product catalogs, rich cart functionalities, integrated stripe payment gateways, and a complete dashboard for vendor management.',
        images: ['/images/project2-placeholder.jpg'],
        githubLink: 'https://github.com',
        liveLink: 'https://demo.com',
        technologies: ['React.js', 'Express.js', 'Node.js', 'MongoDB', 'Redux Toolkit', 'Stripe'],
        category: 'Full Stack',
        views: 95,
        featured: true
      },
      {
        title: 'AI Virtual Assistant',
        description: 'A desktop and web voice-activated artificial intelligence assistant that utilizes Gemini API, Speech-to-Text engines, and custom integrations to automate reminders, email dispatches, and answer queries.',
        images: ['/images/project3-placeholder.jpg'],
        githubLink: 'https://github.com',
        liveLink: 'https://demo.com',
        technologies: ['Python', 'Gemini API', 'SpeechRecognition', 'React.js', 'Node.js'],
        category: 'AI Projects',
        views: 84,
        featured: false
      },
      {
        title: 'TVM School Management System',
        description: 'A comprehensive, role-based platform for school administration. Manages student databases, fees, schedules, attendance logs, exam schedules, and teacher assignments securely.',
        images: ['/images/project4-placeholder.jpg'],
        githubLink: 'https://github.com',
        liveLink: 'https://demo.com',
        technologies: ['Java', 'Spring Boot', 'MySQL', 'React.js', 'Bootstrap'],
        category: 'Web Development',
        views: 65,
        featured: false
      }
    ];
    await Project.insertMany(projectsList);
    console.log('Seed: Created Projects successfully.');

    // 5. Seed Experience
    const experiencesList = [
      {
        role: 'Full-Stack Developer Intern',
        company: 'InnovateTech Solutions',
        type: 'Internship',
        duration: 'Jun 2025 - Aug 2025',
        description: [
          'Developed responsive frontend pages using React.js and Tailwind CSS.',
          'Built RESTful API services in Node.js/Express, reducing response latency by 20%.',
          'Worked on MongoDB databases aggregation pipelines for analytics dashboards.'
        ],
        order: 1
      },
      {
        role: 'Web Developer Intern',
        company: 'SIRT Coding Cell',
        type: 'Internship',
        duration: 'Dec 2024 - Feb 2025',
        description: [
          'Maintained college event web portals using HTML5, CSS3, and JavaScript.',
          'Integrated feedback databases utilizing MySQL to register over 1000+ student profiles.'
        ],
        order: 2
      }
    ];
    await Experience.insertMany(experiencesList);
    console.log('Seed: Created Experience successfully.');

    // 6. Seed Achievements
    const achievementsList = [
      {
        title: 'Smart India Hackathon Grand Finalist',
        description: 'Selected as a grand finalist for our proposal on cryptocurrency fraud detection and address pathing algorithms (organized by Govt. of India).',
        date: new Date('2024-11-20'),
        category: 'Hackathon'
      },
      {
        title: 'NPTEL Java Certification',
        description: 'Scored Elite+Silver in NPTEL Programming in Java online certification program (organized by IIT Kharagpur).',
        date: new Date('2024-04-15'),
        category: 'Certification'
      },
      {
        title: 'Tata Forage Cybersecurity Simulation',
        description: 'Completed a virtual internship simulation focused on vulnerability scanning, IAM configurations, and defensive security architectures.',
        date: new Date('2024-08-10'),
        category: 'Certification'
      },
      {
        title: 'Deloitte Data Analytics Simulation',
        description: 'Completed data analytics simulation course focusing on data modeling, dashboards visualization, and SQL query analysis.',
        date: new Date('2024-09-05'),
        category: 'Certification'
      },
      {
        title: 'AWS Summit India Participation',
        description: 'Attended the developer workshop sessions on AWS Serverless computing (Lambda, API Gateway) and AI services (Bedrock, SageMaker).',
        date: new Date('2024-05-12'),
        category: 'Academic'
      }
    ];
    await Achievement.insertMany(achievementsList);
    console.log('Seed: Created Achievements successfully.');

    // 7. Seed Certificates
    const certificatesList = [
      {
        name: 'Programming in Java (NPTEL)',
        imageUrl: '/images/nptel-cert.jpg',
        pdfUrl: '#',
        credentialUrl: 'https://nptel.ac.in',
        date: new Date('2024-04-15')
      },
      {
        name: 'AWS Cloud Practitioner Essentials',
        imageUrl: '/images/aws-cert.jpg',
        pdfUrl: '#',
        credentialUrl: 'https://aws.amazon.com',
        date: new Date('2024-06-20')
      }
    ];
    await Certificate.insertMany(certificatesList);
    console.log('Seed: Created Certificates successfully.');

    // 8. Seed Testimonials
    const testimonialsList = [
      {
        clientName: 'Dr. R. K. Shrivastava',
        feedback: 'Sunny is an exceptional student with a great work ethic. His participation in the Smart India Hackathon and his ability to design complex blockchain tools was highly impressive.',
        designation: 'Professor & HOD CSIT, SIRT',
        avatar: '/images/avatar1-placeholder.jpg',
        isApproved: true
      },
      {
        clientName: 'Amit Verma',
        feedback: 'Working with Sunny during our hackathon was a great experience. He handled the backend Node.js APIs and DB pipelines with ease and resolved complex integration issues swiftly.',
        designation: 'SIH Team Leader & Peer',
        avatar: '/images/avatar2-placeholder.jpg',
        isApproved: true
      }
    ];
    await Testimonial.insertMany(testimonialsList);
    console.log('Seed: Created Testimonials successfully.');

    // 9. Seed Blogs
    const blogsList = [
      {
        title: 'How I Built a Cryptocurrency Fraud Tracking App',
        slug: 'how-i-built-cryptocurrency-fraud-tracker',
        content: '<p>During the Smart India Hackathon, our team was tasked with tracking illicit transactions on the blockchain. In this article, I explain how we used Node.js, Graph databases, and machine learning clustering algorithms to identify clusters and transaction paths...</p><h3>Why Blockchain Tracking is Hard</h3><p>Unlike standard banking databases, blockchains are public but anonymous. We set up graph nodes using address paths and implemented Dijkstra algorithms to detect path splits.</p>',
        coverImage: '/images/blog1-placeholder.jpg',
        tags: ['SIH', 'Blockchain', 'Node.js', 'AI']
      },
      {
        title: 'Mastering Java OOPs for Technical Interviews',
        slug: 'mastering-java-oops-for-interviews',
        content: '<p>Java remains one of the core industry backend languages. In this guide, I summarize the key NPTEL concepts, abstraction, inheritance, polymorphism, and encapsulation examples that frequently appear in college placements...</p>',
        coverImage: '/images/blog2-placeholder.jpg',
        tags: ['Java', 'OOP', 'Interviews', 'NPTEL']
      }
    ];
    await Blog.insertMany(blogsList);
    console.log('Seed: Created Blogs successfully.');

    // 10. Seed Analytics (Simulate historical visitors over the last 15 days)
    const mockAnalytics = [];
    const countries = ['India', 'India', 'India', 'United States', 'United Kingdom', 'Germany', 'Canada', 'India'];
    const paths = ['/', '/', '/', '/projects', '/blogs', '/about', '/#contact', '/projects/how-i-built-cryptocurrency-fraud-tracker'];
    
    for (let i = 15; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Random number of visits per day
      const visits = Math.floor(Math.random() * 8) + 3;
      for (let j = 0; j < visits; j++) {
        mockAnalytics.push({
          ip: `192.168.1.${Math.floor(Math.random() * 100) + 1}`,
          country: countries[Math.floor(Math.random() * countries.length)],
          path: paths[Math.floor(Math.random() * paths.length)],
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          date: date
        });
      }
    }
    await Analytics.insertMany(mockAnalytics);
    console.log('Seed: Created Visitor Analytics history successfully.');

    console.log('Database seeding process completed successfully!');
    if (shouldClose) {
      mongoose.connection.close();
    }
  } catch (error) {
    console.error('Seeding process encountered an error:', error);
    if (shouldClose) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

if (require.main === module) {
  seedData(true);
}

module.exports = seedData;
