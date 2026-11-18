import { FORMATIONS } from './formations';

export const validateFormation = (formation, lineup) => {
  if (!formation || !FORMATIONS[formation]) {
    return { valid: false, errors: ['Invalid formation'] };
  }

  const requiredPositions = FORMATIONS[formation].positions.map((p) => p.id);
  const errors = [];
  const filledPositions = Object.keys(lineup).filter(
    (pos) => lineup[pos] !== null && lineup[pos] !== undefined
  );

  requiredPositions.forEach((pos) => {
    if (!filledPositions.includes(pos)) {
      errors.push(`Missing player in position: ${pos}`);
    }
  });

  if (filledPositions.length > requiredPositions.length) {
    errors.push(`Too many players for formation ${formation}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    requiredCount: requiredPositions.length,
    filledCount: filledPositions.length,
  };
};

export const getAvailableFormations = () => {
  return Object.keys(FORMATIONS).map((key) => ({
    key,
    name: FORMATIONS[key].name,
    positions: FORMATIONS[key].positions.length,
  }));
};
