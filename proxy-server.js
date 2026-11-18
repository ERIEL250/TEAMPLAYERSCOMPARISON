const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

// Enable CORS for your React app
app.use(cors({ origin: 'http://localhost:3000' }));

// Rate limiting configuration - TheSportsDB free tier allows ~1 request/second
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // 1.1 seconds to be safe
const requestQueue = [];

// Process queued requests with rate limiting
async function processQueue() {
  if (requestQueue.length === 0) return;
  
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    // Wait until we can make the next request
    setTimeout(processQueue, MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    return;
  }
  
  // Get the next request from the queue
  const { playerName, resolve, reject } = requestQueue.shift();
  lastRequestTime = Date.now();
  
  try {
    const apiUrl = `https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${encodeURIComponent(playerName)}`;
    const response = await axios.get(apiUrl, { timeout: 10000 });
    resolve(response.data);
  } catch (error) {
    reject(error);
  }
  
  // Process next request
  setTimeout(processQueue, 0);
}

// TheSportsDB proxy endpoint with rate limiting
app.get('/api/searchplayers.php', async (req, res) => {
  try {
    const playerName = req.query.p;
    if (!playerName) {
      return res.status(400).json({ error: 'Player name parameter "p" is required' });
    }
    
    // Add request to queue
    const requestPromise = new Promise((resolve, reject) => {
      requestQueue.push({ playerName, resolve, reject });
    });
    
    // Start processing the queue if it's not already running
    if (requestQueue.length === 1) {
      processQueue();
    }
    
    const data = await requestPromise;
    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    const status = error.response?.status || 500;
    res.status(status).json({ 
      error: 'Failed to fetch player data',
      message: error.message
    });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log('Rate limiting enabled: max 1 request per second to TheSportsDB');
  console.log('Start the app with: npm run dev');
});