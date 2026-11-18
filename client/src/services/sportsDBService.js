import axios from 'axios';
import { getPlayerImageUrl } from '../utils/imageProvider';

// Use local proxy instead of direct API calls to avoid CORS and rate limiting issues
const SPORTS_DB_PROXY_URL = '/api/searchplayers.php';

export const DEFAULT_PLAYER_IMAGE =
  'https://cdn-icons-png.flaticon.com/512/149/149071.png';

const CONFIG = {
  maxConcurrentRequests: 5,
  // Optimized delay for better throughput while respecting rate limits
  requestDelay: 500,
  requestTimeout: 15000,
  maxRetries: 1, // Allow 1 retry for transient failures
  localStorageKey: 'football_player_images',
  maxCacheAge: 7 * 24 * 60 * 60 * 1000,
  maxFileSize: 5 * 1024 * 1024,
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
  preloadBatchSize: 20,
};

class SportsDBService {
  constructor() {
    this.queue = [];
    this.activeRequests = 0;
    this.pendingRequests = new Map();
    this.cachedImages = this.loadCacheFromStorage();
    this.queueTimer = null;
    this.lastRequestStartedAt = 0;
  }

  loadCacheFromStorage() {
    try {
      const stored = localStorage.getItem(CONFIG.localStorageKey);
      if (!stored) return {};
      const parsed = JSON.parse(stored);
      const now = Date.now();
      return Object.fromEntries(
        Object.entries(parsed).filter(
          ([, entry]) =>
            entry &&
            entry.timestamp &&
            now - entry.timestamp < CONFIG.maxCacheAge
        )
      );
    } catch (error) {
      console.warn('Could not load player image cache:', error);
      return {};
    }
  }

  saveCacheToStorage() {
    try {
      localStorage.setItem(
        CONFIG.localStorageKey,
        JSON.stringify(this.cachedImages)
      );
    } catch (error) {
      // localStorage can fill up, especially when users upload large images.
      console.warn('Could not save player image cache:', error);
    }
  }

  getCachedImage(playerId) {
    return this.cachedImages[String(playerId)]?.url || null;
  }

  addManualUpload(playerId, dataUrl) {
    this.cachedImages[String(playerId)] = {
      url: dataUrl,
      timestamp: Date.now(),
      source: 'manual',
    };
    this.saveCacheToStorage();
  }

  async processManualUpload(file) {
    if (!file || !CONFIG.allowedFileTypes.includes(file.type)) {
      throw new Error(
        'Invalid image type. Please choose a JPG, PNG, or WebP image.'
      );
    }
    if (file.size > CONFIG.maxFileSize) {
      throw new Error('Image is too large. The maximum file size is 5MB.');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () =>
        reject(new Error('Could not read the selected image.'));
      reader.readAsDataURL(file);
    });
  }

  fetchPlayerImage(player) {
    if (!player || player.id == null) {
      return Promise.resolve(DEFAULT_PLAYER_IMAGE);
    }
    const playerId = String(player.id);

    // Check local mapping FIRST - no API call needed!
    const localUrl = getPlayerImageUrl(player);
    if (localUrl && localUrl !== DEFAULT_PLAYER_IMAGE) {
      // Cache the local URL immediately
      this.cachedImages[playerId] = {
        url: localUrl,
        timestamp: Date.now(),
        source: 'local_mapping',
      };
      this.saveCacheToStorage();
      return Promise.resolve(localUrl);
    }

    const cached = this.cachedImages[playerId];
    if (cached?.url) return Promise.resolve(cached.url);
    if (this.pendingRequests.has(playerId))
      return this.pendingRequests.get(playerId);

    const promise = new Promise((resolve) => {
      this.queue.push({ player, resolve, playerId });
      this.processQueue();
    });

    this.pendingRequests.set(playerId, promise);
    const cleanup = () => this.pendingRequests.delete(playerId);
    promise.then(cleanup, cleanup);
    return promise;
  }

  processQueue() {
    if (
      !this.queue.length ||
      this.activeRequests >= CONFIG.maxConcurrentRequests
    )
      return;
    if (this.queueTimer) return;

    const elapsed = Date.now() - this.lastRequestStartedAt;
    const wait = Math.max(0, CONFIG.requestDelay - elapsed);

    this.queueTimer = setTimeout(() => {
      this.queueTimer = null;
      if (
        !this.queue.length ||
        this.activeRequests >= CONFIG.maxConcurrentRequests
      )
        return;

      const item = this.queue.shift();
      this.activeRequests += 1;
      this.lastRequestStartedAt = Date.now();

      this.executePlayerSearch(item.player)
        .then(item.resolve)
        .catch((error) => {
          console.warn(
            `Player image lookup failed for ${item.player?.name || 'player'}:`,
            error
          );
          item.resolve(DEFAULT_PLAYER_IMAGE);
        })
        .finally(() => {
          this.activeRequests -= 1;
          // Process next request after this one completes
          setTimeout(() => this.processQueue(), CONFIG.requestDelay);
        });
    }, wait);
  }

  async executePlayerSearch(player) {
    const playerId = String(player.id);
    const existing = this.cachedImages[playerId];
    if (existing?.url) return existing.url;

    const name = String(
      player.name || `${player.firstName || ''} ${player.lastName || ''}`
    ).trim();
    if (!name) return this.cacheDefault(playerId);

    let response;

    try {
      // Use local proxy to avoid CORS and rate limiting issues
      response = await axios.get(SPORTS_DB_PROXY_URL, {
        params: { p: name },
        timeout: CONFIG.requestTimeout,
        headers: { Accept: 'application/json' },
      });
    } catch (error) {
      const status = error.response?.status;
      console.warn(
        `Failed to fetch player data for "${name}": Status ${status || 'network error'}`
      );
      return this.cacheDefault(playerId);
    }

    const players = Array.isArray(response?.data?.player)
      ? response.data.player
      : [];
    if (!players.length) return this.cacheDefault(playerId);

    const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const bestMatch =
      players.find((candidate) => {
        const candidateName = String(candidate.strPlayer || '')
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
        return candidateName === normalizedName && candidate.strThumb;
      }) || players.find((candidate) => candidate.strThumb);

    if (!bestMatch?.strThumb) return this.cacheDefault(playerId);

    this.cachedImages[playerId] = {
      url: bestMatch.strThumb,
      timestamp: Date.now(),
      source: 'thesportsdb',
    };
    this.saveCacheToStorage();
    return bestMatch.strThumb;
  }

  cacheDefault(playerId) {
    // Cache "not found" briefly using the normal cache TTL to avoid repeated failing lookups.
    // Manual uploads always replace this entry and persist for the same TTL.
    this.cachedImages[String(playerId)] = {
      url: DEFAULT_PLAYER_IMAGE,
      timestamp: Date.now(),
      source: 'default',
    };
    this.saveCacheToStorage();
    return DEFAULT_PLAYER_IMAGE;
  }

  async bulkFetchAllPlayerImages(allPlayers = [], onImageLoaded = () => {}) {
    const validPlayers = allPlayers.filter(
      (player) => player && player.id != null
    );
    const results = await Promise.all(
      validPlayers.map(async (player) => {
        const url = await this.fetchPlayerImage(player);
        try {
          onImageLoaded(player.id, url);
        } catch (error) {
          console.warn('onImageLoaded callback failed:', error);
        }
        return { playerId: player.id, url };
      })
    );
    return Object.fromEntries(
      results.map(({ playerId, url }) => [playerId, url])
    );
  }

  async processPlayersWithPriority(
    startingPlayers = [],
    otherPlayers = [],
    onImageLoaded = () => {}
  ) {
    return this.bulkFetchAllPlayerImages(
      [...startingPlayers, ...otherPlayers],
      onImageLoaded
    );
  }

  getImageUrlWithSize(originalUrl) {
    return originalUrl || DEFAULT_PLAYER_IMAGE;
  }

  handleError(error) {
    if (error.response?.status === 429) {
      return new Error(
        'TheSportsDB rate limit reached. Please wait before trying again.'
      );
    }
    if (error.response?.status === 404) {
      return new Error('The requested player was not found.');
    }
    return new Error(
      error.response?.data?.error ||
        error.message ||
        'Failed to fetch player image.'
    );
  }
}

const sportsDBService = new SportsDBService();
export default sportsDBService;
export const IMAGE_CONFIG = CONFIG;
