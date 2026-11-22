require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;
const API_BASE = 'https://api.football-data.org/v4';
const API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const SPORTS_DB_BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const FOOTBALL_API_SPORTS_BASE = 'https://v3.football.api-sports.io';
const FOOTBALL_API_SPORTS_KEY = process.env.FOOTBALL_API_SPORTS;

const cache = new NodeCache({ stdTTL: 3600 });
const sportsDbCache = new NodeCache({ stdTTL: 86400 });
const footballApiSportsCache = new NodeCache({ stdTTL: 86400 });

const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60000;
const MAX_REQUESTS_PER_MINUTE = 30;

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const PLAYER_IMAGES_DIR = path.join(UPLOADS_DIR, 'players');
const IMAGE_MAPPINGS_FILE = path.join(UPLOADS_DIR, 'player-mappings.json');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(PLAYER_IMAGES_DIR)) {
  fs.mkdirSync(PLAYER_IMAGES_DIR, { recursive: true });
}

let playerImageMappings = {};
if (fs.existsSync(IMAGE_MAPPINGS_FILE)) {
  try {
    playerImageMappings = JSON.parse(fs.readFileSync(IMAGE_MAPPINGS_FILE, 'utf8'));
  } catch (error) {
    console.warn('Could not load player image mappings:', error);
    playerImageMappings = {};
  }
}

const savePlayerMappings = () => {
  try {
    fs.writeFileSync(IMAGE_MAPPINGS_FILE, JSON.stringify(playerImageMappings, null, 2));
  } catch (error) {
    console.error('Could not save player image mappings:', error);
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PLAYER_IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'));
    }
  },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

const validateEnvironment = () => {
  const issues = [];
  if (!API_KEY) {
    issues.push('FOOTBALL_DATA_API_KEY is not set in environment variables');
  }
  if (!FOOTBALL_API_SPORTS_KEY) {
    issues.push('FOOTBALL_API_SPORTS is not set in environment variables');
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

app.get('/api/football-api-sports/team-players/:teamId', async (req, res) => {
  const { teamId } = req.params;
  const cacheKey = `football_api_sports_team_players_${teamId}`;
  const cachedData = footballApiSportsCache.get(cacheKey);
  
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(`${FOOTBALL_API_SPORTS_BASE}/players/squads`, {
      params: { team: teamId },
      headers: { 'x-apisports-key': FOOTBALL_API_SPORTS_KEY },
      timeout: 15000
    });
    footballApiSportsCache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error(`Football API Sports Error for team ${teamId}:`, error.response?.data || error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'Failed to fetch team players from Football API Sports';
    res.status(statusCode).json({ error: errorMessage, details: error.response?.data });
  }
});

app.get('/api/football-api-sports/player-photo/:playerId', async (req, res) => {
  const { playerId } = req.params;
  const cacheKey = `football_api_sports_player_photo_${playerId}`;
  const cachedData = footballApiSportsCache.get(cacheKey);
  
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get(`${FOOTBALL_API_SPORTS_BASE}/players`, {
      params: { id: playerId },
      headers: { 'x-apisports-key': FOOTBALL_API_SPORTS_KEY },
      timeout: 15000
    });
    footballApiSportsCache.set(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    console.error(`Football API Sports Error for player ${playerId}:`, error.response?.data || error.message);
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || 'Failed to fetch player photo from Football API Sports';
    res.status(statusCode).json({ error: errorMessage, details: error.response?.data });
  }
});

app.get('/api/player-images', (req, res) => {
  res.json(playerImageMappings);
});

app.post('/api/player-images/:playerId', upload.single('image'), (req, res) => {
  const { playerId } = req.params;
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const existingMapping = playerImageMappings[playerId];
  if (existingMapping) {
    const oldImagePath = path.join(PLAYER_IMAGES_DIR, existingMapping.filename);
    if (fs.existsSync(oldImagePath)) {
      try {
        fs.unlinkSync(oldImagePath);
      } catch (error) {
        console.warn('Could not delete old player image:', error);
      }
    }
  }

  const imageUrl = `/uploads/players/${req.file.filename}`;
  playerImageMappings[playerId] = {
    filename: req.file.filename,
    url: imageUrl,
    uploadedAt: new Date().toISOString(),
  };
  savePlayerMappings();

  res.json({ success: true, url: imageUrl });
});

app.delete('/api/player-images/:playerId', (req, res) => {
  const { playerId } = req.params;
  const existingMapping = playerImageMappings[playerId];
  
  if (!existingMapping) {
    return res.status(404).json({ error: 'Player image not found' });
  }

  const imagePath = path.join(PLAYER_IMAGES_DIR, existingMapping.filename);
  if (fs.existsSync(imagePath)) {
    try {
      fs.unlinkSync(imagePath);
    } catch (error) {
      console.warn('Could not delete player image file:', error);
    }
  }

  delete playerImageMappings[playerId];
  savePlayerMappings();

  res.json({ success: true });
});

app.get('/api/competitions', checkApiKey, async (req, res) => {
  await proxyRequest(req, res, '/competitions');
});

app.get('/api/competitions/:competitionCode/teams', checkApiKey, async (req, res) => {
  await proxyRequest(req, res, `/competitions/${req.params.competitionCode}/teams`);
});

app.get('/api/teams/:teamId', checkApiKey, async (req, res) => {
  await proxyRequest(req, res, `/teams/${req.params.teamId}`);
});

app.get('/api/health', (req, res) => {
  const envIssues = validateEnvironment();
  res.json({ 
    status: 'ok', 
    apiKeyConfigured: !!API_KEY,
    footballApiSportsConfigured: !!FOOTBALL_API_SPORTS_KEY,
    cacheStats: cache.getStats(),
    sportsDbCacheStats: sportsDbCache.getStats(),
    footballApiSportsCacheStats: footballApiSportsCache.getStats(),
    environmentIssues: envIssues,
    rateLimitConfig: {
      maxRequestsPerMinute: MAX_REQUESTS_PER_MINUTE,
      windowMs: RATE_LIMIT_WINDOW
    },
    playerImageCount: Object.keys(playerImageMappings).length
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
  console.log(`Football API Sports configured: ${!!FOOTBALL_API_SPORTS_KEY}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`TheSportsDB proxy endpoint: /api/searchplayers.php`);
  console.log(`Football API Sports endpoints: /api/football-api-sports/*`);
  console.log(`Player image uploads directory: ${PLAYER_IMAGES_DIR}`);
  console.log(`Loaded ${Object.keys(playerImageMappings).length} player image mappings`);
});