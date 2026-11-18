import sportsDBService from '../services/sportsDBService';

class ImagePreloader {
  constructor() {
    this.preloadedImages = new Map();
    this.isPreloading = false;
    this.preloadQueue = [];
  }

  preloadImage(url) {
    if (!url || this.preloadedImages.has(url)) {
      return Promise.resolve(url);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.preloadedImages.set(url, true);
        resolve(url);
      };
      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${url}`));
      };
      img.src = url;
    });
  }

  async preloadPlayerImages(playerList) {
    if (!playerList || !Array.isArray(playerList) || playerList.length === 0) {
      return;
    }

    this.isPreloading = true;
    const uniquePlayers = [
      ...new Map(playerList.map((p) => [p.id, p])).values(),
    ];

    const imageUrls = await Promise.all(
      uniquePlayers.map(async (player) => {
        try {
          const url = await sportsDBService.fetchPlayerImage(player);
          if (
            url &&
            url !== 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
          ) {
            await this.preloadImage(url);
            return url;
          }
          return null;
        } catch (error) {
          console.warn('Preload failed for player:', player?.name, error);
          return null;
        }
      })
    );

    this.isPreloading = false;
    return imageUrls.filter(Boolean);
  }

  preloadTeamCrests(teamList) {
    if (!teamList || !Array.isArray(teamList) || teamList.length === 0) {
      return;
    }

    teamList.forEach((team) => {
      if (team.crest) {
        this.preloadImage(team.crest).catch(() => {});
      }
    });
  }

  preloadCompetitionLogos(competitionList) {
    if (
      !competitionList ||
      !Array.isArray(competitionList) ||
      competitionList.length === 0
    ) {
      return;
    }

    competitionList.forEach((comp) => {
      if (comp.emblem) {
        this.preloadImage(comp.emblem).catch(() => {});
      }
    });
  }

  isImagePreloaded(url) {
    return this.preloadedImages.has(url);
  }

  getPreloadCount() {
    return this.preloadedImages.size;
  }

  clearPreloadedImages() {
    this.preloadedImages.clear();
  }
}

const imagePreloader = new ImagePreloader();
export default imagePreloader;
