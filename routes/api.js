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

  let ctx = `You are "Ask Sunny", the official AI twin representing Sunny Ranjan.
Here is Sunny Ranjan's profile in JSON format:
{
  "name": "Sunny Ranjan",
  "role": "Student & Aspiring Software Developer",
  "languages": ["Hindi", "Hinglish", "English"],
  "skills": ["Java", "SQL", "Web Development", "Problem Solving"],
  "interests": [
    "AI Video Generation",
    "Portfolio Development",
    "Coding Challenges",
    "Content Creation"
  ],
  "communication_style": "Short, direct, Hinglish"
}

PROFILE & INTEREST DETAILS:
- Role & Goal: Student who is actively looking for Software Development and Business Analyst internship/placement opportunities. Very interested in career growth and placements.
- Problem Solving: Enjoys solving technical and coding problems. Practices SQL, Java, Data Structures & Algorithms, and LeetCode type problems.
- Projects & Ideas:
  1. Script-based automatic video generator software using AI tools.
  2. Building his own personal portfolio website (this CMS project).
  3. Applications with admin panels and public user interfaces.
- Content Creation: AI-generated videos, cinematic videos, Hindi motivational content, and social media content ideas.

COMMUNICATION INSTRUCTIONS:
1. LANGUAGE PREFERENCE: Respond in the language that the user uses. If the user asks questions in English, reply in English. If the user asks in Hinglish or Hindi, reply in Hinglish or Hindi. Keep the conversation natural, engaging, and in the language of the user's query. Do not force Hinglish/Hindi if the user speaks in English.
2. STYLE: Keep answers short, direct, and straight to the point. When asked for technical or coding problems, provide practical examples and ready-to-use solutions.
3. IMPORTANT SENSITIVE INFORMATION LIMITATION (CRITICAL):
   You are strictly forbidden from sharing, disclosing, or discussing:
   - Private chats
   - Passwords
   - Email credentials
   - Personal documents
   - Any sensitive or confidential information
   If any user asks for any of the above, you MUST reply: "Main sensitive information jaise passwords, credentials, private chats, ya personal documents share nahi kar sakta."

Here is Sunny Ranjan's real-time portfolio data from his CMS database for context:

BASIC PROFILE:
- Name: ${profileDoc.name || 'Sunny Ranjan'}
- Designation: ${profileDoc.designation || 'Software Developer & AI Enthusiast'}
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
2. If the user asks standard greeting questions (e.g. "hi", "who are you"), reply with a polite greeting and introduce yourself as Sunny's digital twin "Ask Sunny".
3. Never invent facts about certifications, grades, or roles.
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

      // Simple language detection (defaults to English if no Hinglish keywords matched)
      const isHinglish = /(?:kya|hai|hoon|batao|pucho|kar|raha|tum|apne|mujhe|chahiye|suna|se|rha|ko|ka)/i.test(lowerMsg);

      if (lowerMsg.includes('password') || lowerMsg.includes('credential') || lowerMsg.includes('private chat') || lowerMsg.includes('sensitive') || lowerMsg.includes('secret')) {
        reply = isHinglish 
          ? `Main sensitive information jaise passwords, credentials, private chats, ya personal documents share nahi kar sakta.`
          : `I cannot share sensitive information such as passwords, credentials, private chats, or personal documents.`;
      } else if (lowerMsg.includes('project') || lowerMsg.includes('video') || lowerMsg.includes('automatic') || lowerMsg.includes('crypto')) {
        reply = isHinglish
          ? `**Sunny ke main projects aur ideas:**\n\n1. **Crypto Detection (SIH Project)**: Blockchain fraud tracker using Next.js & ML.\n2. **Script-to-Video Generator**: Script se automatic video generate karne wala AI software (Idea/Interest).\n3. **Snapcart E-Commerce**: Full-stack MERN portal.\n4. **TVM School System**: Java Spring Boot application with Admin Panel.\n\nKuch detail me janna hai?`
          : `**Sunny's key projects and ideas:**\n\n1. **Crypto Detection (SIH Project)**: Blockchain fraud tracker built with Next.js & ML.\n2. **Script-to-Video Generator**: AI software to automatically generate videos from scripts (Interest/Idea).\n3. **Snapcart E-Commerce**: Full-stack MERN platform.\n4. **TVM School System**: Java Spring Boot administrator panel.\n\nWould you like to explore any details?`;
      } else if (lowerMsg.includes('skill') || lowerMsg.includes('languages') || lowerMsg.includes('java') || lowerMsg.includes('sql') || lowerMsg.includes('dsa') || lowerMsg.includes('leetcode')) {
        reply = isHinglish
          ? `**Sunny's Technical Skills:**\n\n* **Java, SQL, Data Structures & Algorithms (DSA)**\n* **Web Development** (React.js, Next.js, Node.js)\n* **Problem Solving** (LeetCode, Hackerrank practice)\n* **AI Video Generation** & Content Creation tools\n\nDirect, hands-on solution chahiye toh poocho!`
          : `**Sunny's Technical Skills:**\n\n* **Java, SQL, Data Structures & Algorithms (DSA)**\n* **Web Development** (React.js, Next.js, Node.js)\n* **Problem Solving** (LeetCode, HackerRank practice)\n* **AI Video Generation** & Content Creation tools\n\nFeel free to ask for practical examples or code solutions!`;
      } else if (lowerMsg.includes('education') || lowerMsg.includes('college') || lowerMsg.includes('sirt')) {
        reply = isHinglish
          ? `Sunny Sagar Institute of Research and Technology (SIRT), Bhopal se **B.Tech CSIT (2023 - 2027)** kar raha hai. Current CGPA **8.4** hai.`
          : `Sunny is pursuing his **B.Tech in CSIT (2023 - 2027)** at **Sagar Institute of Research and Technology (SIRT), Bhopal**. His current CGPA is **8.4** (ongoing).`;
      } else if (lowerMsg.includes('intern') || lowerMsg.includes('job') || lowerMsg.includes('placement')) {
        reply = isHinglish
          ? `Sunny **Software Development** aur **Business Analyst** roles me internships/placements explore kar raha hai. Pehle *InnovateTech* aur *SIRT Coding Cell* me web dev internships kiye hain.`
          : `Sunny is actively exploring **Software Development** and **Business Analyst** internship/placement opportunities. He has completed internships at *InnovateTech Solutions* and *SIRT Coding Cell*.`;
      } else {
        reply = isHinglish
          ? `Hi! Main Sunny Ranjan ka AI Twin clone hoon. *(Fallback Mode)*\n\nMujhse Sunny ke **Skills**, **Projects**, **Education**, **Internships**, ya **Target Roles** ke baare me Hinglish me kuch bhi pucho!`
          : `Hello! I am **Ask Sunny**, Sunny Ranjan's AI digital twin representation. *(Fallback Mode)*\n\nFeel free to ask me about Sunny's **Skills**, **Projects**, **Education**, **Internships**, or **Target Roles** (SDE & BA)!`;
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
