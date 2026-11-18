require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 5000;
const API_BASE = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const SPORTS_DB_BASE = 'https://www.thesportsdb.com/api/v1/json/3';

const cache = new NodeCache({ stdTTL: 3600 });
const sportsDbCache = new NodeCache({ stdTTL: 86400 });

const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS_PER_MINUTE = 30;

app.use(cors());
app.use(express.json());

const validateEnvironment = () => {
  const issues = [];
  if (!API_KEY) {
    issues.push('FOOTBALL_DATA_API_KEY is not set in environment variables');
  }
  return issues;
};

const checkApiKey = (req, res, next) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'FOOTBALL_DATA_API_KEY not configured in server environment' });
  }
  next();
};

const rateLimitMiddleware = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimit.has(clientIp)) {
    rateLimit.set(clientIp, []);
  }
  
  const requests = rateLimit.get(clientIp).filter(time => time > windowStart);
  rateLimit.set(clientIp, requests);
  
  if (requests.length >= MAX_REQUESTS_PER_MINUTE) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
  }
  
  requests.push(now);
  next();
};

const proxyRequest = async (req, res, endpoint) => {
  const cacheKey = endpoint;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(`${API_BASE}${endpoint}`, {
      headers: { 'X-Auth-Token': API_KEY }
    });
    cache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error.response?.data || error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'Failed to fetch data from football-data.org';
    res.status(statusCode).json({ error: errorMessage, details: error.response?.data });
  }
};

app.get('/api/searchplayers.php', rateLimitMiddleware, async (req, res) => {
  const searchQuery = req.query.p;
  if (!searchQuery) {
    return res.status(400).json({ error: 'Search query parameter "p" is required' });
  }

  const cacheKey = `sportsdb_search_${searchQuery.toLowerCase()}`;
  const cachedData = sportsDbCache.get(cacheKey);
  
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(`${SPORTS_DB_BASE}/searchplayers.php`, {
      params: { p: searchQuery },
      timeout: 15000,
      headers: { Accept: 'application/json' }
    });
    sportsDbCache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error(`TheSportsDB API Error for "${searchQuery}":`, error.response?.data || error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'Failed to fetch player data from TheSportsDB';
    res.status(statusCode).json({ error: errorMessage, details: error.response?.data });
  }
});

app.get('/api/competitions', checkApiKey, (req, res) => {
  proxyRequest(req, res, '/competitions');
});

app.get('/api/competitions/:code', checkApiKey, (req, res) => {
  proxyRequest(req, res, `/competitions/${req.params.code}`);
});

app.get('/api/competitions/:code/teams', checkApiKey, (req, res) => {
  proxyRequest(req, res, `/competitions/${req.params.code}/teams`);
});

app.get('/api/competitions/:code/standings', checkApiKey, (req, res) => {
  proxyRequest(req, res, `/competitions/${req.params.code}/standings`);
});

app.get('/api/competitions/:code/scorers', checkApiKey, (req, res) => {
  proxyRequest(req, res, `/competitions/${req.params.code}/scorers`);
});

app.get('/api/teams/:id', checkApiKey, (req, res) => {
  proxyRequest(req, res, `/teams/${req.params.id}`);
});

app.get('/api/teams/:id/matches', checkApiKey, (req, res) => {
  proxyRequest(req, res, `/teams/${req.params.id}/matches`);
});

app.get('/api/persons/:id', checkApiKey, (req, res) => {
  proxyRequest(req, res, `/persons/${req.params.id}`);
});

app.get('/api/health', (req, res) => {
  const envIssues = validateEnvironment();
  res.json({ 
    status: 'ok', 
    apiKeyConfigured: !!API_KEY,
    cacheStats: cache.getStats(),
    sportsDbCacheStats: sportsDbCache.getStats(),
    environmentIssues: envIssues,
    rateLimitConfig: {
      maxRequestsPerMinute: MAX_REQUESTS_PER_MINUTE,
      windowMs: RATE_LIMIT_WINDOW
    }
  });
});

const envIssues = validateEnvironment();
if (envIssues.length > 0) {
  console.warn('⚠️  Environment configuration issues detected:');
  envIssues.forEach(issue => console.warn(`  - ${issue}`));
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Key configured: ${!!API_KEY}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`TheSportsDB proxy endpoint: /api/searchplayers.php`);
});