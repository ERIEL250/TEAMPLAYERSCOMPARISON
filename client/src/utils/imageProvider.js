// Image Provider Abstraction - Separated from football-data.org core API
// Configuration can be set via environment variables or local mappings

// Configuration - Update these in your .env file for different providers
const IMAGE_CONFIG = {
  // TheSportsDB (free tier, non-commercial use with attribution)
  thesportsdb: {
    baseUrl: 'https://www.thesportsdb.com/images/media',
    playerPath: '/player',
    teamPath: '/team',
    competitionPath: '/league',
    enabled: true,
    attribution: 'Data provided by TheSportsDB',
  },
  // API-Football (require API key, paid tiers for commercial use)
  apifootball: {
    baseUrl: 'https://media.api-sports.io/football',
    playerPath: '/players',
    teamPath: '/teams',
    competitionPath: '/leagues',
    enabled: false,
    apiKey: process.env.REACT_APP_API_FOOTBALL_KEY || '',
  },
  // Local fallback base URL for self-hosted images
  local: {
    baseUrl: '/images',
    enabled: false,
  },
  // Generic fallback configuration
  fallback: {
    silhouetteUrl: 'https://cdn-icons-png.flaticon.com/512/1149/1149166.png', // Neutral football player silhouette (free for non-commercial use)
    initialsUrl:
      'https://ui-avatars.com/api/?background=random&size=128&bold=true',
  },
};

// Local mappings for known entities - use stable identifiers (football-data.org IDs where possible)
const LOCAL_MAPPINGS = {
  players: {
    // Arsenal First Team Players (football-data.org IDs)
    3189: 'https://www.thesportsdb.com/images/media/player/player/kepaarrizabalaga.png', // Kepa Arrizabalaga
    4832: 'https://www.thesportsdb.com/images/media/player/player/davidraya.png', // David Raya
    74831:
      'https://www.thesportsdb.com/images/media/player/player/illanmeslier.png', // Illan Meslier
    6154: 'https://www.thesportsdb.com/images/media/player/player/benwhite.png', // Ben White
    6317: 'https://www.thesportsdb.com/images/media/player/player/ezrikonsa.png', // Ezri Konsa
    23128:
      'https://www.thesportsdb.com/images/media/player/player/gabrielmagalhaes.png', // Gabriel Magalhães
    80171:
      'https://www.thesportsdb.com/images/media/player/player/williamsaliba.png', // William Saliba
    98816:
      'https://www.thesportsdb.com/images/media/player/player/jurrientimber.png', // Jurrien Timber
    125674:
      'https://www.thesportsdb.com/images/media/player/player/pierohincapie.png', // Piero Hincapié
    133512:
      'https://www.thesportsdb.com/images/media/player/player/riccardocalafiori.png', // Riccardo Calafiori
    172839:
      'https://www.thesportsdb.com/images/media/player/player/cristhianmosquera.png', // Cristhian Mosquera
    1684: 'https://www.thesportsdb.com/images/media/player/player/brunoguimaraes.png', // Bruno Guimarães
    4032: 'https://www.thesportsdb.com/images/media/player/player/eberechieze.png', // Eberechi Eze
    7427: 'https://www.thesportsdb.com/images/media/player/player/martinodegaard.png', // Martin Ødegaard
    7935: 'https://www.thesportsdb.com/images/media/player/player/mikelmerino.png', // Mikel Merino
    8215: 'https://www.thesportsdb.com/images/media/player/player/declanrice.png', // Declan Rice
    115035:
      'https://www.thesportsdb.com/images/media/player/player/martinzubimendi.png', // Martín Zubimendi
    244120:
      'https://www.thesportsdb.com/images/media/player/player/myleslewisskelly.png', // Myles Lewis-Skelly
    171: 'https://www.thesportsdb.com/images/media/player/player/kaihavertz.png', // Kai Havertz
    8279: 'https://www.thesportsdb.com/images/media/player/player/viktorgyokeres.png', // Viktor Gyökeres
    99813:
      'https://www.thesportsdb.com/images/media/player/player/bukayosaka.png', // Bukayo Saka
    144434:
      'https://www.thesportsdb.com/images/media/player/player/christostzolis.png', // Christos Tzolis
    167720:
      'https://www.thesportsdb.com/images/media/player/player/nanimadueke.png', // Noni Madueke
    285128:
      'https://www.thesportsdb.com/images/media/player/player/maxdowman.png', // Max Dowman
    302255:
      'https://www.thesportsdb.com/images/media/player/player/maalikhaschi.png', // Maalik Hashi
    3141: 'https://www.thesportsdb.com/images/media/player/player/emilianomartinez.png', // Emiliano Martínez
    137544:
      'https://www.thesportsdb.com/images/media/player/player/gabrielslonina.png', // Gabriel Slonina
    175910:
      'https://www.thesportsdb.com/images/media/player/player/teddysharmanlowe.png', // Teddy Sharman-Lowe
    191068:
      'https://www.thesportsdb.com/images/media/player/player/mikependers.png', // Mike Penders
    8545: 'https://www.thesportsdb.com/images/media/player/player/wesleyfofana.png', // Wesley Fofana
    56628:
      'https://www.thesportsdb.com/images/media/player/player/reecejames.png', // Reece James
    82351:
      'https://www.thesportsdb.com/images/media/player/player/maxencelacroix.png', // Maxence Lacroix
    // Additional common players
    34181621:
      'https://www.thesportsdb.com/images/media/player/player/gavinbazunu.png', // Gavin Bazunu
    169041:
      'https://www.thesportsdb.com/images/media/player/player/jackbonham.png', // Jack Bonham
    341482:
      'https://www.thesportsdb.com/images/media/player/player/davidharrington.png', // David Harrington
    335049:
      'https://www.thesportsdb.com/images/media/player/player/nathanbroome.png', // Nathan Broome
  },
  teams: {
    // Example: "66" (Manchester United): "/manchester-united.png"
    66: 'team/bn9wn6x0si5h20pr0c05ss0ck.png', // Man Utd crest from TheSportsDB
    65: 'team/t4yn903nri4b0gtt9unr68ubk.png', // Man City crest
    73: 'team/qjkbnb9s1u3m73u175757lmbm.png', // Liverpool crest
    64: 'team/tv9sq3g4i046ur633v6kkq8bs.png', // Arsenal crest
    57: 'team/ec3wllj83vmsbmm925s92b7ce.png', // Barcelona crest
    58: 'team/x6318zq69pfu194c5274n3n5b.png', // Real Madrid crest
  },
  competitions: {
    // Example: "2002" (Premier League): "/premier-league.png"
    2002: 'league/0r5ow10h5x905v9u2m206s76n.png', // Premier League logo
    2014: 'league/sv9skn5b79u2b5934m5728bcs.png', // La Liga logo
    2001: 'league/h9d6r6u6c6y827u667050nbq.png', // Champions League logo
  },
};

// Get player image URL - primary function for player portraits
export const getPlayerImageUrl = (player) => {
  const { id } = player;

  // First check local mapping for the player ID
  if (LOCAL_MAPPINGS.players[id]) {
    // If the mapped value is already a full URL, use it directly
    const mappedUrl = LOCAL_MAPPINGS.players[id];
    if (mappedUrl.startsWith('http://') || mappedUrl.startsWith('https://')) {
      return mappedUrl;
    }
    // Otherwise build the path from config
    if (IMAGE_CONFIG.local.enabled) {
      return `${IMAGE_CONFIG.local.baseUrl}/${mappedUrl}`;
    }
    if (IMAGE_CONFIG.thesportsdb.enabled) {
      return `${IMAGE_CONFIG.thesportsdb.baseUrl}/${IMAGE_CONFIG.thesportsdb.playerPath}/${mappedUrl}`;
    }
  }

  // If no local mapping or valid config, use the neutral silhouette fallback
  return IMAGE_CONFIG.fallback.silhouetteUrl;
};

// Get team crest URL - primary function for club badges
export const getTeamCrestUrl = (team) => {
  const { id, crest, name } = team;

  // First use football-data.org crest if available
  if (crest) return crest;

  // Check local mapping for team ID
  if (LOCAL_MAPPINGS.teams[id]) {
    if (IMAGE_CONFIG.thesportsdb.enabled) {
      return `${IMAGE_CONFIG.thesportsdb.baseUrl}/${IMAGE_CONFIG.thesportsdb.teamPath}/${LOCAL_MAPPINGS.teams[id]}`;
    }
    if (IMAGE_CONFIG.local.enabled) {
      return `${IMAGE_CONFIG.local.baseUrl}/${LOCAL_MAPPINGS.teams[id]}`;
    }
  }

  // Fallback to generic silhouette with team initials
  return `${IMAGE_CONFIG.fallback.initialsUrl}&name=${encodeURIComponent(name.substring(0, 3).toUpperCase())}`;
};

// Get competition logo URL - primary function for league/cup logos
export const getCompetitionLogoUrl = (competition) => {
  const { id, name, emblem } = competition;

  // First use football-data.org emblem if available
  if (emblem) return emblem;

  // Check local mapping for competition ID
  if (LOCAL_MAPPINGS.competitions[id]) {
    if (IMAGE_CONFIG.thesportsdb.enabled) {
      return `${IMAGE_CONFIG.thesportsdb.baseUrl}/${IMAGE_CONFIG.thesportsdb.competitionPath}/${LOCAL_MAPPINGS.competitions[id]}`;
    }
    if (IMAGE_CONFIG.local.enabled) {
      return `${IMAGE_CONFIG.local.baseUrl}/${LOCAL_MAPPINGS.competitions[id]}`;
    }
  }

  // Fallback to initials
  return `${IMAGE_CONFIG.fallback.initialsUrl}&name=${encodeURIComponent(name.substring(0, 3).toUpperCase())}`;
};

// Export configuration for documentation and reference
export const getImageConfig = () => IMAGE_CONFIG;
export const getLocalMappings = () => LOCAL_MAPPINGS;
