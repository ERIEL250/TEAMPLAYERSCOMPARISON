// This utility clears old silhouette-only cache entries to allow new local mappings to take effect
export const clearOldSilhouetteCache = () => {
  try {
    const cacheKey = 'football_player_images';
    const existingCache = localStorage.getItem(cacheKey);

    if (existingCache) {
      const parsed = JSON.parse(existingCache);
      const filteredCache = Object.fromEntries(
        Object.entries(parsed).filter(
          ([, entry]) =>
            entry.url !==
            'https://cdn-icons-png.flaticon.com/512/149/149071.png'
        )
      );
      localStorage.setItem(cacheKey, JSON.stringify(filteredCache));
      console.log('Cleared old silhouette cache entries');
    }
  } catch (error) {
    console.warn('Could not clear old cache:', error);
  }
};
