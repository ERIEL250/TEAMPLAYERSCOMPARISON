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
  onDragOver,
  onDragLeave,
  onDrop,
  dragOverSlot,
  onPlayerDragStart,
  onPlayerDragEnd,
}) => {
  const formationData = getFormation(formation);

  const playerMap = new Map();
  startingPlayers.forEach((sp) => {
    if (sp.positionId && sp.player) {
      playerMap.set(sp.positionId, sp.player);
    }
  });

  console.log(`FootballPitch ${formation} - startingPlayers:`, startingPlayers);
  console.log(`FootballPitch ${formation} - playerMap:`, Array.from(playerMap.entries()));
  console.log(`FootballPitch ${formation} - playerImages:`, playerImages);
  console.log(`FootballPitch ${formation} - formation positions:`, formationData.positions.map((p) => p.id));

  const substituteSlots = Array(5).fill(null);
  substitutes.forEach((sub, index) => {
    if (index < 5) substituteSlots[index] = sub;
  });

  return (
    <div className="pitch-container">
      <div className="football-pitch">
        <div className="pitch-halfway-line"></div>
        <div className="pitch-center-circle"></div>
        <div className="pitch-center-spot"></div>
        <div className="penalty-area bottom"></div>
        <div className="penalty-area top"></div>
        <div className="six-yard-box bottom"></div>
        <div className="six-yard-box top"></div>
        <div className="goal bottom"></div>
        <div className="goal top"></div>
        <div className="penalty-spot bottom"></div>
        <div className="penalty-spot top"></div>

        {formationData.positions.map((position) => {
          const player = playerMap.get(position.id) || null;
          const isDragOver = dragOverSlot === position.id;

          return (
            <div
              key={position.id}
              className={`pitch-player-slot ${player ? 'filled' : 'empty'} ${isEditable ? 'selectable' : ''} ${isDragOver ? 'drag-over' : ''}`}
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
              onDragOver={(e) => isEditable && onDragOver && onDragOver(e, position.id)}
              onDragLeave={() => isEditable && onDragLeave && onDragLeave()}
              onDrop={() => isEditable && onDrop && onDrop(position.id)}
            >
              {player ? (
                <div
                  className="pitch-player-card"
                  draggable={isEditable}
                  onDragStart={(e) => {
                    if (isEditable && onPlayerDragStart) {
                      e.dataTransfer.effectAllowed = 'move';
                      const sourceIndex = startingPlayers.findIndex(sp => sp.positionId === position.id);
                      onPlayerDragStart(player, 'starting', sourceIndex);
                    }
                  }}
                  onDragEnd={() => isEditable && onPlayerDragEnd && onPlayerDragEnd()}
                >
                  <PlayerImage
                    player={player}
                    size={40}
                    manualUploadEnabled={isEditable}
                  />
                  <div className="player-details">
                    <span className="player-short-name">
                      {player.name.split(' ').pop()}
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

      <div className="substitute-bench">
        <h4 className="bench-title">Substitutes ({substitutes.length}/5)</h4>
        <div className="bench-slots">
          {substituteSlots.map((sub, index) => {
            const slotId = `sub-${index}`;
            const isDragOver = dragOverSlot === slotId;

            return (
              <div
                key={slotId}
                className={`bench-slot ${sub ? 'filled' : 'empty'} ${isEditable ? 'selectable' : ''} ${isDragOver ? 'drag-over' : ''}`}
                onClick={() =>
                  isEditable &&
                  onPlayerSelect &&
                  onPlayerSelect(slotId, sub)
                }
                onDragOver={(e) => isEditable && onDragOver && onDragOver(e, slotId)}
                onDragLeave={() => isEditable && onDragLeave && onDragLeave()}
                onDrop={() => isEditable && onDrop && onDrop(slotId)}
              >
                {sub ? (
                  <div
                    className="bench-player-card"
                    draggable={isEditable}
                    onDragStart={(e) => {
                      if (isEditable && onPlayerDragStart) {
                        e.dataTransfer.effectAllowed = 'move';
                        onPlayerDragStart(sub, 'substitute', index);
                      }
                    }}
                    onDragEnd={() => isEditable && onPlayerDragEnd && onPlayerDragEnd()}
                  >
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FootballPitch;