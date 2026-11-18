export const POSITION_CATEGORIES = {
  GOALKEEPER: ['Goalkeeper', 'GK'],
  DEFENDER: [
    'Defender',
    'Left-Back',
    'Right-Back',
    'Centre-Back',
    'CB',
    'LB',
    'RB',
    'DF',
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
  ],
  OTHER: [],
};

export const groupPlayersByPosition = (players) => {
  const grouped = {
    GOALKEEPER: [],
    DEFENDER: [],
    MIDFIELDER: [],
    FORWARD: [],
    OTHER: [],
  };

  players.forEach((player) => {
    const position = player.position;
    if (POSITION_CATEGORIES.GOALKEEPER.includes(position)) {
      grouped.GOALKEEPER.push(player);
    } else if (POSITION_CATEGORIES.DEFENDER.includes(position)) {
      grouped.DEFENDER.push(player);
    } else if (POSITION_CATEGORIES.MIDFIELDER.includes(position)) {
      grouped.MIDFIELDER.push(player);
    } else if (POSITION_CATEGORIES.FORWARD.includes(position)) {
      grouped.FORWARD.push(player);
    } else {
      grouped.OTHER.push(player);
    }
  });

  return grouped;
};

export const filterPlayers = (players, search, positionFilter) => {
  return players.filter((player) => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesPosition =
      positionFilter === 'ALL' ||
      (positionFilter === 'OTHER'
        ? !Object.entries(POSITION_CATEGORIES).some(
            ([key, values]) =>
              key !== 'OTHER' && values.includes(player.position)
          )
        : POSITION_CATEGORIES[positionFilter]?.includes(player.position));
    return matchesSearch && matchesPosition;
  });
};
