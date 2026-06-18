const useragent = require('useragent');
const Analytics = require('../models/Analytics');
const https = require('https');

// Helper to check if IP is private
const isPrivateIp = (ip) => {
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('fe80:')
  );
};

// Async country resolver
const getCountryFromIp = (ip) => {
  return new Promise((resolve) => {
    if (isPrivateIp(ip)) {
      return resolve('Localhost');
    }

    const cleanIp = ip.split(',')[0].trim().replace('::ffff:', '');
    
    https.get(`https://ipapi.co/${cleanIp}/json/`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.country_name || 'Unknown');
        } catch (e) {
          resolve('Unknown');
        }
      });
    }).on('error', () => {
      resolve('Unknown');
    }).setTimeout(1500, function() {
      this.destroy();
      resolve('Unknown');
    });
  });
};

const trackVisitor = async (req, res, next) => {
  // Only track GET requests for public pages
  if (req.method !== 'GET') return next();

  const path = req.path;
  
  // Skip assets, media, admin pages, and api requests
  const skipPaths = [
    '/css/', '/js/', '/images/', '/uploads/', '/favicon.ico', 
    '/admin', '/api/', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf'
  ];
  
  const shouldSkip = skipPaths.some(p => path.startsWith(p) || path.endsWith(p));
  if (shouldSkip) return next();

  // Parse IP Address
  let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  if (ip.includes(',')) {
    ip = ip.split(',')[0].trim();
  }

  // Parse User Agent
  const agent = useragent.parse(req.headers['user-agent']);
  const os = agent.os.toString();
  const browser = agent.toAgent();
  const uaString = `${browser} on ${os}`;

  // Log in background so we don't slow down request response
  res.on('finish', async () => {
    try {
      const country = await getCountryFromIp(ip);
      await Analytics.create({
        ip,
        country,
        path,
        userAgent: uaString,
        date: new Date()
      });
    } catch (error) {
      console.error('Analytics log error:', error.message);
    }
  });

  next();
};

module.exports = trackVisitor;
