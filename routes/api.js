const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Import models
const Profile = require('../models/Profile');
const Skill = require('../models/Skill');
const Project = require('../models/Project');
const Experience = require('../models/Experience');
const Certificate = require('../models/Certificate');
const Achievement = require('../models/Achievement');
const Message = require('../models/Message');
const Analytics = require('../models/Analytics');

// ==========================================
// 1. "ASK SUNNY" CHATBOT WITH GEMINI API
// ==========================================

// Initialize Gemini
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log('Gemini AI system successfully initialized.');
} else {
  console.log('Gemini API Key missing. Chatbot will run in local fallback mode.');
}

// Helper: Compile all portfolio info into a structured text context block
const getPortfolioContext = async () => {
  const [profile, skills, projects, experiences, certificates, achievements] = await Promise.all([
    Profile.findOne(),
    Skill.find(),
    Project.find(),
    Experience.find().sort({ order: 1 }),
    Certificate.find(),
    Achievement.find()
  ]);

  const profileDoc = profile || {};

  let ctx = `You are "Ask Sunny", an AI assistant representing Sunny Ranjan, a Software Developer student.
Your role is to answer questions from prospective employers, college recruiters, and users about Sunny's qualifications.
Keep your answers professional, helpful, brief, and structured in clean Markdown format. 
Speak in the third-person or as Sunny's friendly digital twin representation.

Here is Sunny Ranjan's real-time portfolio data from his CMS database:

BASIC PROFILE:
- Name: ${profileDoc.name || 'Sunny Ranjan'}
- Designation: ${profileDoc.designation || 'Software Developer'}
- College: Sagar Institute of Research and Technology (SIRT), Bhopal
- Degree: B.Tech in Computer Science & Information Technology (CSIT) (Expected Graduation: 2023 - 2027)
- Current Score: CGPA 8.4 (ongoing)
- Email: ${profileDoc.email || 'sunny824118@gmail.com'}
- Phone: ${profileDoc.phone || '+91 9117461058'}
- Location: ${profileDoc.address || 'Bhopal, MP, India'}
- Career Objective: ${profileDoc.careerObjective || 'To grow as a software developer.'}
- Bio: ${profileDoc.bio || 'Passionate about coding.'}

SOCIAL LINKS:
- GitHub: ${profileDoc.socialLinks?.github || 'N/A'}
- LinkedIn: ${profileDoc.socialLinks?.linkedin || 'N/A'}
- LeetCode: ${profileDoc.socialLinks?.leetcode || 'N/A'}
- HackerRank: ${profileDoc.socialLinks?.hackerrank || 'N/A'}
- CodeChef: ${profileDoc.socialLinks?.codechef || 'N/A'}

SKILLS BY CATEGORY:
${skills.map(s => `- ${s.name} (${s.category}, level: ${s.level}%)`).join('\n')}

PROJECTS:
${projects.map(p => `* "${p.title}" (${p.category}): ${p.description}\n  Tech Stack: ${p.technologies.join(', ')}\n  GitHub Link: ${p.githubLink || 'N/A'}\n  Live Demo: ${p.liveLink || 'N/A'}`).join('\n\n')}

EXPERIENCE & INTERNSHIPS:
${experiences.map(e => `- ${e.role} at ${e.company} (${e.duration}, Type: ${e.type})\n  Details:\n  ${e.description.map(d => `  * ${d}`).join('\n')}`).join('\n\n')}

CERTIFICATIONS:
${certificates.map(c => `- ${c.name} (Issued: ${c.date.toDateString()})\n  Verification: ${c.credentialUrl || 'N/A'}`).join('\n')}

ACHIEVEMENTS & HACKATHONS:
${achievements.map(a => `- ${a.title} (Category: ${a.category}, Date: ${a.date.toDateString()}): ${a.description}`).join('\n')}

INSTRUCTIONS:
1. ONLY answer questions using the facts provided above. If asked about something not present, politely say that Sunny is currently exploring that or you don't have that detail.
2. If the user asks standard greeting questions (e.g. "hi", "who are you"), reply with a polite greeting and introduce yourself as "Ask Sunny".
3. Never invent facts about certifications, grades, or roles.
4. Keep the replies highly aesthetic and clear.
`;

  return ctx;
};

// @desc    Handle chat message
// @route   POST /api/chat
router.post('/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  try {
    const context = await getPortfolioContext();

    let reply = '';

    if (genAI) {
      try {
        // Configure model
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: context
        });

        // Simple Chat logic or direct content generation
        const chatHistory = [];
        if (history && Array.isArray(history)) {
          history.forEach(msg => {
            chatHistory.push({
              role: msg.role === 'user' ? 'user' : 'model',
              parts: [{ text: msg.content }]
            });
          });
        }

        const chat = model.startChat({
          history: chatHistory,
        });

        const result = await chat.sendMessage(message);
        reply = result.response.text();
      } catch (geminiError) {
        console.error('Gemini API call failed. Falling back to local engine:', geminiError.message);
      }
    }

    if (!reply) {
      // Local Fallback response if Gemini key is missing or API call fails
      const lowerMsg = message.toLowerCase();

      if (lowerMsg.includes('project') || lowerMsg.includes('crypto') || lowerMsg.includes('snapcart')) {
        reply = `**Sunny Ranjan's Projects:**\n\n1. **Crypto Detection (SIH Project)**: Platform for identifying blockchain frauds using Next.js & ML.\n2. **Snapcart E-Commerce**: Full-stack MERN platform with payment gateway.\n3. **AI Virtual Assistant**: Python desktop companion using Gemini API.\n4. **TVM School Management System**: Java Spring Boot administrator panel.\n\nWhich project details would you like to explore?`;
      } else if (lowerMsg.includes('skill') || lowerMsg.includes('languages') || lowerMsg.includes('react')) {
        reply = `**Sunny Ranjan's Core Skills:**\n\n* **Languages:** Java, Python, JavaScript, TypeScript\n* **Frontend:** React.js, Next.js, HTML, CSS, Tailwind\n* **Backend & DB:** Node.js, Express.js, Spring Boot, MongoDB, MySQL\n* **Cloud & Tools:** AWS, Power BI, Git, GitHub\n* **Specialization:** AI/ML solutions`;
      } else if (lowerMsg.includes('education') || lowerMsg.includes('college') || lowerMsg.includes('sirt')) {
        reply = `Sunny is pursuing his **B.Tech in CSIT (2023 - 2027)** at **Sagar Institute of Research and Technology (SIRT), Bhopal**. His current CGPA score is **8.4** (ongoing).`;
      } else if (lowerMsg.includes('achievement') || lowerMsg.includes('hackathon') || lowerMsg.includes('sih')) {
        reply = `Sunny's major achievements include:\n* **Smart India Hackathon (SIH) Grand Finalist** (for Cryptocurrency Fraud Detection tracker)\n* **NPTEL Java Certification** (Elite + Silver rank)\n* **Tata Forage Cybersecurity Simulation**\n* **Deloitte Data Analytics Virtual Simulation**\n* **AWS Summit India Participant**`;
      } else if (lowerMsg.includes('experience') || lowerMsg.includes('intern')) {
        reply = `Sunny has completed internship roles:\n1. **Full-Stack Developer Intern** at *InnovateTech Solutions* (June - August 2025).\n2. **Web Developer Intern** at *SIRT Coding Cell* (December 2024 - February 2025).`;
      } else {
        reply = `Hello! I am **Ask Sunny**, Sunny Ranjan's AI digital twin. *(Note: Gemini API is running in local fallback mode).* I can guide you through Sunny's **Skills**, **Projects**, **Education**, **Internships**, and **Achievements**. What would you like to know?`;
      }
    }

    return res.json({ success: true, reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ success: false, message: 'Gemini API transaction failed: ' + error.message });
  }
});

// ==========================================
// 2. VISITOR ANALYTICS CHART DATA (AJAX)
// ==========================================

// @desc    Retrieve analytics dataset for admin dashboard charts
// @route   GET /api/analytics
router.get('/analytics', async (req, res) => {
  try {
    // 1. Gather Visitor Trends (visits count per day for the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendsRaw = await Analytics.aggregate([
      { $match: { date: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format visitor trends to complete daily array (even if count is 0)
    const trendsLabels = [];
    const trendsData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = d.toISOString().split('T')[0];
      trendsLabels.push(d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
      
      const found = trendsRaw.find(t => t._id === str);
      trendsData.push(found ? found.count : 0);
    }

    // 2. Gather Project Views (Distribution of top viewed projects)
    const topProjects = await Project.find().sort({ views: -1 }).limit(5);
    const projectsLabels = topProjects.map(p => p.title);
    const projectsData = topProjects.map(p => p.views);

    // 3. Gather Message/Contact Analytics
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ isRead: false });
    const readMessages = totalMessages - unreadMessages;

    // 4. Gather Country wise visitors
    const countryStats = await Analytics.aggregate([
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const countryLabels = countryStats.map(c => c._id || 'Unknown');
    const countryData = countryStats.map(c => c.count);

    res.json({
      success: true,
      trends: {
        labels: trendsLabels,
        data: trendsData
      },
      projects: {
        labels: projectsLabels,
        data: projectsData
      },
      messages: {
        total: totalMessages,
        read: readMessages,
        unread: unreadMessages
      },
      countries: {
        labels: countryLabels,
        data: countryData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Analytics aggregation error: ' + error.message });
  }
});

module.exports = router;
