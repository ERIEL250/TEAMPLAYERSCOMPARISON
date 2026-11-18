import React from 'react';
import PlayerImage from './PlayerImage';
import { getFormation } from '../utils/formations';
import './FootballPitch.css';

const FootballPitch = ({
  formation,
  startingPlayers,
  substitutes,
  playerImages = {},
  onPlayerSelect,
  isEditable = false,
}) => {
  const formationData = getFormation(formation);

  // Create a proper map that links formation position IDs to assigned players
  // startingPlayers array contains { positionId, player } objects from TeamBuilder
  const playerMap = new Map();
  startingPlayers.forEach((sp) => {
    if (sp.positionId && sp.player) {
      playerMap.set(sp.positionId, sp.player);
    }
  });

  // Log for debugging - track if players are being mapped correctly
  console.log(`FootballPitch ${formation} - startingPlayers:`, startingPlayers);
  console.log(
    `FootballPitch ${formation} - playerMap:`,
    Array.from(playerMap.entries())
  );
  console.log(`FootballPitch ${formation} - playerImages:`, playerImages);
  console.log(
    `FootballPitch ${formation} - formation positions:`,
    formationData.positions.map((p) => p.id)
  );

  // Substitute slots - always 5 available
  const substituteSlots = Array(5).fill(null);
  substitutes.forEach((sub, index) => {
    if (index < 5) substituteSlots[index] = sub;
  });

  return (
    <div className="pitch-container">
      <div className="football-pitch">
        {/* Pitch markings */}
        <div className="pitch-halfway-line"></div>
        <div className="pitch-center-circle"></div>
        <div className="pitch-center-spot"></div>

        {/* Penalty areas */}
        <div className="penalty-area bottom"></div>
        <div className="penalty-area top"></div>

        {/* Six-yard boxes */}
        <div className="six-yard-box bottom"></div>
        <div className="six-yard-box top"></div>

        {/* Goals */}
        <div className="goal bottom"></div>
        <div className="goal top"></div>

        {/* Penalty spots */}
        <div className="penalty-spot bottom"></div>
        <div className="penalty-spot top"></div>

        {/* Player positions */}
        {formationData.positions.map((position) => {
          const player = playerMap.get(position.id) || null;

          return (
            <div
              key={position.id}
              className={`pitch-player-slot ${player ? 'filled' : 'empty'} ${isEditable ? 'selectable' : ''}`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() =>
                isEditable &&
                onPlayerSelect &&
                onPlayerSelect(position.id, player)
              }
            >
              {player ? (
                <div className="pitch-player-card">
                  <PlayerImage
                    player={player}
                    size={40}
                    manualUploadEnabled={isEditable}
                  />
                  <div className="player-details">
                    <span className="player-short-name">
                      {player.name.split(' ').pop()} {/* Last name only */}
                    </span>
                    <span className="player-position-code">
                      {position.id.toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="empty-slot-indicator">
                  <span className="slot-position">
                    {position.id.toUpperCase()}
                  </span>
                  <span className="empty-text">Empty</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Substitute bench */}
      <div className="substitute-bench">
        <h4 className="bench-title">Substitutes ({substitutes.length}/5)</h4>
        <div className="bench-slots">
          {substituteSlots.map((sub, index) => (
            <div
              key={`sub-${index}`}
              className={`bench-slot ${sub ? 'filled' : 'empty'} ${isEditable ? 'selectable' : ''}`}
              onClick={() =>
                isEditable &&
                onPlayerSelect &&
                onPlayerSelect(`sub-${index}`, sub)
              }
            >
              {sub ? (
                <div className="bench-player-card">
                  <PlayerImage
                    player={sub}
                    size={36}
                    manualUploadEnabled={isEditable}
                  />
                  <div className="bench-player-details">
                    <span className="bench-player-name">
                      {sub.name.split(' ').pop()}
                    </span>
                    <span className="bench-player-position">
                      {sub.position?.split('-')[0] || 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="empty-bench-slot">
                  <span>Empty</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FootballPitch;
