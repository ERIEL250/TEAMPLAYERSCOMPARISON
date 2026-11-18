import React from 'react';
import PlayerImage from './PlayerImage';

const PlayerCard = ({ player, isSelected, onToggle, isTeamA }) => {
  return (
    <div
      className={`player-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onToggle(player.id, isTeamA)}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(player.id, isTeamA)}
        className="player-checkbox"
      />
      <PlayerImage player={player} size={56} manualUploadEnabled={true} />
      <div className="player-info">
        <h4 className="player-name">{player.name}</h4>
        <p className="player-position">
          {player.position || 'Position unknown'}
        </p>
      </div>
    </div>
  );
};

export default PlayerCard;
