import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { generateShareURL, copyToClipboard } from '../utils/shareUtils';

function ShareLineupButton() {
  const { state } = useAppContext();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = generateShareURL(state);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      className="share-lineup-btn"
      onClick={handleShare}
      disabled={!state.teamALineup && !state.teamBLineup}
    >
      {copied ? '✅ Copied!' : '📤 Share Lineup'}
    </button>
  );
}

export default ShareLineupButton;
