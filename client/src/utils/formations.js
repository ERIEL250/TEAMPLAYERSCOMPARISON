// Supported football formations with position coordinates for top-down pitch layout
// Coordinates are percentage-based (0-100) to ensure responsiveness
export const FORMATIONS = {
  '4-3-3': {
    name: '4-3-3',
    description: 'Four defenders, three midfielders, three forwards',
    positions: [
      { id: 'gk', name: 'Goalkeeper', category: 'GOALKEEPER', x: 50, y: 92 },
      // Defenders (4)
      { id: 'lb', name: 'Left Back', category: 'DEFENDER', x: 20, y: 75 },
      {
        id: 'lcb',
        name: 'Left Centre-Back',
        category: 'DEFENDER',
        x: 35,
        y: 70,
      },
      {
        id: 'rcb',
        name: 'Right Centre-Back',
        category: 'DEFENDER',
        x: 65,
        y: 70,
      },
      { id: 'rb', name: 'Right Back', category: 'DEFENDER', x: 80, y: 75 },
      // Midfielders (3)
      {
        id: 'cdm',
        name: 'Defensive Midfielder',
        category: 'MIDFIELDER',
        x: 50,
        y: 55,
      },
      {
        id: 'cm1',
        name: 'Central Midfielder',
        category: 'MIDFIELDER',
        x: 35,
        y: 45,
      },
      {
        id: 'cm2',
        name: 'Central Midfielder',
        category: 'MIDFIELDER',
        x: 65,
        y: 45,
      },
      // Forwards (3)
      { id: 'lw', name: 'Left Winger', category: 'FORWARD', x: 20, y: 25 },
      { id: 'st', name: 'Striker', category: 'FORWARD', x: 50, y: 18 },
      { id: 'rw', name: 'Right Winger', category: 'FORWARD', x: 80, y: 25 },
    ],
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    description:
      'Four defenders, two holding midfielders, three attacking midfielders, one striker',
    positions: [
      { id: 'gk', name: 'Goalkeeper', category: 'GOALKEEPER', x: 50, y: 92 },
      // Defenders (4)
      { id: 'lb', name: 'Left Back', category: 'DEFENDER', x: 20, y: 75 },
      {
        id: 'lcb',
        name: 'Left Centre-Back',
        category: 'DEFENDER',
        x: 35,
        y: 70,
      },
      {
        id: 'rcb',
        name: 'Right Centre-Back',
        category: 'DEFENDER',
        x: 65,
        y: 70,
      },
      { id: 'rb', name: 'Right Back', category: 'DEFENDER', x: 80, y: 75 },
      // Holding midfielders (2)
      {
        id: 'cdm1',
        name: 'Defensive Midfielder',
        category: 'MIDFIELDER',
        x: 40,
        y: 55,
      },
      {
        id: 'cdm2',
        name: 'Defensive Midfielder',
        category: 'MIDFIELDER',
        x: 60,
        y: 55,
      },
      // Attacking midfielders (3)
      {
        id: 'cam',
        name: 'Attacking Midfielder',
        category: 'MIDFIELDER',
        x: 50,
        y: 40,
      },
      {
        id: 'lm',
        name: 'Left Midfielder',
        category: 'MIDFIELDER',
        x: 25,
        y: 45,
      },
      {
        id: 'rm',
        name: 'Right Midfielder',
        category: 'MIDFIELDER',
        x: 75,
        y: 45,
      },
      // Striker (1)
      { id: 'st', name: 'Striker', category: 'FORWARD', x: 50, y: 18 },
    ],
  },
  '4-4-2': {
    name: '4-4-2',
    description: 'Four defenders, four midfielders, two strikers',
    positions: [
      { id: 'gk', name: 'Goalkeeper', category: 'GOALKEEPER', x: 50, y: 92 },
      // Defenders (4)
      { id: 'lb', name: 'Left Back', category: 'DEFENDER', x: 20, y: 75 },
      {
        id: 'lcb',
        name: 'Left Centre-Back',
        category: 'DEFENDER',
        x: 35,
        y: 70,
      },
      {
        id: 'rcb',
        name: 'Right Centre-Back',
        category: 'DEFENDER',
        x: 65,
        y: 70,
      },
      { id: 'rb', name: 'Right Back', category: 'DEFENDER', x: 80, y: 75 },
      // Midfielders (4)
      {
        id: 'lm',
        name: 'Left Midfielder',
        category: 'MIDFIELDER',
        x: 25,
        y: 50,
      },
      {
        id: 'cm1',
        name: 'Central Midfielder',
        category: 'MIDFIELDER',
        x: 40,
        y: 55,
      },
      {
        id: 'cm2',
        name: 'Central Midfielder',
        category: 'MIDFIELDER',
        x: 60,
        y: 55,
      },
      {
        id: 'rm',
        name: 'Right Midfielder',
        category: 'MIDFIELDER',
        x: 75,
        y: 50,
      },
      // Strikers (2)
      { id: 'st1', name: 'Striker', category: 'FORWARD', x: 40, y: 25 },
      { id: 'st2', name: 'Striker', category: 'FORWARD', x: 60, y: 25 },
    ],
  },
  '3-5-2': {
    name: '3-5-2',
    description: 'Three defenders, five midfielders, two strikers',
    positions: [
      { id: 'gk', name: 'Goalkeeper', category: 'GOALKEEPER', x: 50, y: 92 },
      // Defenders (3)
      {
        id: 'lcb',
        name: 'Left Centre-Back',
        category: 'DEFENDER',
        x: 30,
        y: 75,
      },
      { id: 'cb', name: 'Centre-Back', category: 'DEFENDER', x: 50, y: 72 },
      {
        id: 'rcb',
        name: 'Right Centre-Back',
        category: 'DEFENDER',
        x: 70,
        y: 75,
      },
      // Midfielders (5)
      {
        id: 'lwb',
        name: 'Left Wing-Back',
        category: 'MIDFIELDER',
        x: 15,
        y: 60,
      },
      {
        id: 'cdm',
        name: 'Defensive Midfielder',
        category: 'MIDFIELDER',
        x: 40,
        y: 58,
      },
      {
        id: 'cm',
        name: 'Central Midfielder',
        category: 'MIDFIELDER',
        x: 50,
        y: 50,
      },
      {
        id: 'rwb',
        name: 'Right Wing-Back',
        category: 'MIDFIELDER',
        x: 85,
        y: 60,
      },
      {
        id: 'cam',
        name: 'Attacking Midfielder',
        category: 'MIDFIELDER',
        x: 60,
        y: 42,
      },
      // Strikers (2)
      { id: 'st1', name: 'Striker', category: 'FORWARD', x: 40, y: 25 },
      { id: 'st2', name: 'Striker', category: 'FORWARD', x: 60, y: 25 },
    ],
  },
  '3-4-3': {
    name: '3-4-3',
    description: 'Three defenders, four midfielders, three forwards',
    positions: [
      { id: 'gk', name: 'Goalkeeper', category: 'GOALKEEPER', x: 50, y: 92 },
      // Defenders (3)
      {
        id: 'lcb',
        name: 'Left Centre-Back',
        category: 'DEFENDER',
        x: 30,
        y: 75,
      },
      { id: 'cb', name: 'Centre-Back', category: 'DEFENDER', x: 50, y: 72 },
      {
        id: 'rcb',
        name: 'Right Centre-Back',
        category: 'DEFENDER',
        x: 70,
        y: 75,
      },
      // Midfielders (4)
      {
        id: 'lm',
        name: 'Left Midfielder',
        category: 'MIDFIELDER',
        x: 25,
        y: 55,
      },
      {
        id: 'cm1',
        name: 'Central Midfielder',
        category: 'MIDFIELDER',
        x: 40,
        y: 50,
      },
      {
        id: 'cm2',
        name: 'Central Midfielder',
        category: 'MIDFIELDER',
        x: 60,
        y: 50,
      },
      {
        id: 'rm',
        name: 'Right Midfielder',
        category: 'MIDFIELDER',
        x: 75,
        y: 55,
      },
      // Forwards (3)
      { id: 'lw', name: 'Left Winger', category: 'FORWARD', x: 20, y: 25 },
      { id: 'st', name: 'Striker', category: 'FORWARD', x: 50, y: 18 },
      { id: 'rw', name: 'Right Winger', category: 'FORWARD', x: 80, y: 25 },
    ],
  },
};

// Position categories for validation
export const POSITION_CATEGORIES = {
  GOALKEEPER: ['Goalkeeper', 'GK', 'Keeper'],
  DEFENDER: [
    'Defender',
    'Left-Back',
    'Right-Back',
    'Centre-Back',
    'CB',
    'LB',
    'RB',
    'DF',
    'Centre Back',
  ],
  MIDFIELDER: [
    'Midfielder',
    'Central Midfield',
    'Attacking Midfield',
    'Defensive Midfield',
    'Left Midfield',
    'Right Midfield',
    'CM',
    'AM',
    'DM',
    'LM',
    'RM',
    'MF',
    'CDM',
    'CAM',
  ],
  FORWARD: [
    'Forward',
    'Striker',
    'Centre-Forward',
    'Left Winger',
    'Right Winger',
    'CF',
    'LW',
    'RW',
    'FW',
    'Striker',
  ],
  OTHER: [],
};

// Validate that a player's position matches the slot's category
export const validatePositionMatch = (player, slotCategory) => {
  const playerPosition = player.position;
  if (!playerPosition) return true; // Allow unknown positions

  const validPositions = POSITION_CATEGORIES[slotCategory];
  if (!validPositions) return true;

  return validPositions.some((validPos) =>
    playerPosition.toLowerCase().includes(validPos.toLowerCase())
  );
};

// Get all available formations
export const getAvailableFormations = () => {
  return Object.keys(FORMATIONS).map((key) => ({
    value: key,
    label: FORMATIONS[key].name,
    description: FORMATIONS[key].description,
  }));
};

// Get formation details by key
export const getFormation = (formationKey) => {
  return FORMATIONS[formationKey] || FORMATIONS['4-3-3'];
};

// Check if a formation has exactly 11 positions (always true for valid formations)
export const validateFormation = (formationKey) => {
  const formation = getFormation(formationKey);
  return formation.positions.length === 11;
};
