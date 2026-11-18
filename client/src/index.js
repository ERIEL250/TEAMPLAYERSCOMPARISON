import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import { initMonitoring } from './utils/monitoring';
import imagePreloader from './utils/imagePreloader';
import sportsDBService from './services/sportsDBService';
import { clearOldSilhouetteCache } from './utils/clearOldCache';

// Initialize monitoring and error tracking
initMonitoring();

// Clear old silhouette-only cache entries to allow new local mappings to take effect
clearOldSilhouetteCache();

// Preload cached player images immediately on app start
const preloadCachedImages = async () => {
  const cachedImages = sportsDBService.loadCacheFromStorage();
  const urls = Object.values(cachedImages)
    .filter(
      (entry) =>
        entry.url &&
        entry.url !== 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
    )
    .map((entry) => entry.url);

  await Promise.allSettled(urls.map((url) => imagePreloader.preloadImage(url)));
  console.log(`Preloaded ${urls.length} cached player images`);
};

preloadCachedImages();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
