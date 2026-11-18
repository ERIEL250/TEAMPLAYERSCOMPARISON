export const generateShareURL = (state) => {
  const shareData = {
    selectedCompetition: state.selectedCompetition,
    teamA: state.teamA,
    teamB: state.teamB,
    teamALineup: state.teamALineup,
    teamBLineup: state.teamBLineup,
  };
  const encoded = btoa(JSON.stringify(shareData));
  return `${window.location.origin}${window.location.pathname}?share=${encoded}`;
};

export const loadFromShareURL = () => {
  const params = new URLSearchParams(window.location.search);
  const shareEncoded = params.get('share');
  if (shareEncoded) {
    try {
      const shareData = JSON.parse(atob(shareEncoded));
      return shareData;
    } catch (err) {
      console.error('Failed to load shared lineup:', err);
      return null;
    }
  }
  return null;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};
