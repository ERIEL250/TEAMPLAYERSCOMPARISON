import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAvailableFormations, getFormation } from '../utils/formations';
import FootballPitch from './FootballPitch';
import PlayerImage from './PlayerImage';
import TeamCrest from './TeamCrest';
import sportsDBService from '../services/sportsDBService';
import './TeamBuilder.css';

const TeamBuilder = ({
  team,
  allPlayers,
  onSave,
  onCancel,
  savedLineup = null,
}) => {
  const [activeTab, setActiveTab] = useState('available');
  const [selectedFormation, setSelectedFormation] = useState('4-3-3');
  const [startingPlayers, setStartingPlayers] = useState([]);
  const [substitutePlayers, setSubstitutePlayers] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  const isEditable = true;

  const formations = getAvailableFormations();
  const formationData = getFormation(selectedFormation);

  useEffect(() => {
    if (savedLineup) {
      setSelectedFormation(savedLineup.formation || '4-3-3');
      setStartingPlayers(savedLineup.startingPlayers || []);
      setSubstitutePlayers(savedLineup.substitutePlayers || []);
    }
  }, [savedLineup]);

  const selectedPlayerIds = useMemo(() => {
    const ids = new Set();
    startingPlayers.forEach((sp) => {
      if (sp.player) ids.add(sp.player.id);
    });
    substitutePlayers.forEach((sp) => ids.add(sp.id));
    return ids;
  }, [startingPlayers, substitutePlayers]);

  const availablePlayers = useMemo(() => {
    return allPlayers.filter(
      (player) =>
        !selectedPlayerIds.has(player.id) &&
        player.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPlayers, selectedPlayerIds, searchQuery]);

  const startingCount = startingPlayers.filter((sp) => sp.player).length;
  const substituteCount = substitutePlayers.length;
  const canAddStarter = startingCount < 11;
  const canAddSubstitute = substituteCount < 5;
  const isLineupComplete = startingCount === 11;

  const handleDragStart = useCallback(
    (player, sourceType, sourceIndex) => {
      let sourcePositionId = null;
      if (sourceType === 'starting' && startingPlayers[sourceIndex]) {
        sourcePositionId = startingPlayers[sourceIndex].positionId;
      }
      setDraggedPlayer({ player, sourceType, sourceIndex, sourcePositionId });
    },
    [startingPlayers]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedPlayer(null);
    setDragOverSlot(null);
  }, []);

  const handleDragOver = useCallback((e, targetSlot) => {
    e.preventDefault();
    setDragOverSlot(targetSlot);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverSlot(null);
  }, []);

  const handleDrop = useCallback(
    (targetSlot) => {
      if (!draggedPlayer) return;

      const { player, sourceType, sourceIndex } = draggedPlayer;

      const isStartingTarget = !targetSlot.startsWith('sub-');
      let isOccupied = false;
      let existingPlayer = null;

      if (isStartingTarget) {
        const existing = startingPlayers.find(
          (sp) => sp.positionId === targetSlot
        );
        if (existing?.player) {
          isOccupied = true;
          existingPlayer = existing.player;
        }
      } else {
        const subIndex = parseInt(targetSlot.split('-')[1]);
        if (substitutePlayers[subIndex]) {
          isOccupied = true;
          existingPlayer = substitutePlayers[subIndex];
        }
      }

      if (isOccupied && existingPlayer) {
        const shouldSwap = window.confirm(
          `${targetSlot.startsWith('sub-') ? 'Substitute slot' : 'Starting slot'} is already occupied by ${existingPlayer.name}.\nDo you want to swap ${player.name} with ${existingPlayer.name}?`
        );
        if (!shouldSwap) {
          setDraggedPlayer(null);
          setDragOverSlot(null);
          return;
        }
      }

      if (isStartingTarget) {
        let newStarters = [...startingPlayers];

        if (sourceType === 'starting') {
          newStarters.splice(sourceIndex, 1);
        } else if (sourceType === 'substitute') {
          const newSubs = [...substitutePlayers];
          newSubs.splice(sourceIndex, 1);
          setSubstitutePlayers(newSubs);
        }

        const existingTargetIndex = newStarters.findIndex(
          (sp) => sp.positionId === targetSlot
        );
        if (existingTargetIndex >= 0) {
          if (sourceType === 'starting') {
            const sourceOriginalIndex = newStarters.findIndex(
              (sp) => sp.positionId === draggedPlayer.sourcePositionId
            );
            if (sourceOriginalIndex >= 0) {
              const sourceSlot = startingPlayers[sourceIndex].positionId;
              const existingPlayerAtTarget =
                newStarters[existingTargetIndex].player;
              newStarters = newStarters.filter(
                (sp) => sp.positionId !== targetSlot
              );
              newStarters.push({
                positionId: sourceSlot,
                player: existingPlayerAtTarget,
              });
            }
          } else {
            newStarters = newStarters.filter(
              (sp) => sp.positionId !== targetSlot
            );
          }
        }

        newStarters.push({ positionId: targetSlot, player });
        setStartingPlayers(newStarters);
      } else {
        const subIndex = parseInt(targetSlot.split('-')[1]);
        if (subIndex >= 0 && subIndex < 5) {
          let newSubs = [...substitutePlayers];
          let newStarters = [...startingPlayers];

          if (sourceType === 'starting') {
            newStarters.splice(sourceIndex, 1);
            setStartingPlayers(newStarters);
          } else if (sourceType === 'substitute') {
            newSubs.splice(sourceIndex, 1);
          }

          if (newSubs[subIndex]) {
            if (sourceType === 'substitute') {
              const existingPlayer = newSubs[subIndex];
              newSubs.splice(subIndex, 1);
              newSubs.splice(
                sourceIndex > subIndex ? sourceIndex : sourceIndex,
                0,
                existingPlayer
              );
            } else {
              newSubs.splice(subIndex, 1);
            }
          }

          newSubs.splice(subIndex, 0, player);
          setSubstitutePlayers(newSubs.slice(0, 5));
        }
      }

      setDraggedPlayer(null);
      setDragOverSlot(null);
    },
    [draggedPlayer, startingPlayers, substitutePlayers]
  );

  const assignPlayerToSlot = useCallback((player, slot = selectedSlot) => {
    if (!slot) return;

    if (slot.startsWith('sub-')) {
      const subIndex = parseInt(slot.split('-')[1]);
      if (subIndex >= 0 && subIndex < 5) {
        const newSubs = [...substitutePlayers];
        if (newSubs[subIndex]) {
          newSubs.splice(subIndex, 1);
        }
        newSubs.splice(subIndex, 0, player);
        setSubstitutePlayers(newSubs.slice(0, 5));
      }
    } else {
      if (
        !canAddStarter &&
        !startingPlayers.find((sp) => sp.positionId === slot)
      ) {
        return;
      }

      const existingIndex = startingPlayers.findIndex(
        (sp) => sp.positionId === slot
      );
      const newStarters = [...startingPlayers];

      if (existingIndex >= 0) {
        newStarters.splice(existingIndex, 1);
      }

      newStarters.push({ positionId: slot, player });
      setStartingPlayers(newStarters);
    }

    setSelectedSlot(null);
    setSelectedPlayer(null);
  }, [selectedSlot, substitutePlayers, canAddStarter, startingPlayers]);

  const addToStartingLineup = useCallback(() => {
    if (!selectedPlayer) return;

    const emptySlot = formationData.positions.find(
      (slot) => !startingPlayers.find((sp) => sp.positionId === slot.id)
    );

    if (emptySlot) {
      assignPlayerToSlot(selectedPlayer, emptySlot.id);
    }
  }, [selectedPlayer, formationData.positions, startingPlayers, assignPlayerToSlot]);

  const addToSubstitutes = useCallback(() => {
    if (!selectedPlayer || !canAddSubstitute) return;

    const emptySubIndex = substitutePlayers.length;
    if (emptySubIndex < 5) {
      const newSubs = [...substitutePlayers];
      newSubs.splice(emptySubIndex, 0, selectedPlayer);
      setSubstitutePlayers(newSubs.slice(0, 5));
      setSelectedPlayer(null);
    }
  }, [selectedPlayer, canAddSubstitute, substitutePlayers]);

  const removePlayerFromSlot = useCallback((positionId, isSubstitute = false) => {
    if (isSubstitute) {
      const subIndex = parseInt(positionId.split('-')[1]);
      const newSubs = [...substitutePlayers];
      newSubs.splice(subIndex, 1);
      setSubstitutePlayers(newSubs);
    } else {
      const newStarters = startingPlayers.filter(
        (sp) => sp.positionId !== positionId
      );
      setStartingPlayers(newStarters);
    }
  }, [startingPlayers, substitutePlayers]);

  const handlePitchSlotClick = useCallback((slotId, currentPlayer) => {
    if (currentPlayer) {
      const isSub = slotId.startsWith('sub-');
      if (window.confirm(`Remove ${currentPlayer.name} from this slot?`)) {
        removePlayerFromSlot(slotId, isSub);
      }
    } else {
      setSelectedSlot(slotId);
      setSelectedPlayer(null);
      setActiveTab('available');
    }
  }, [removePlayerFromSlot]);

  const handlePlayerCardClick = useCallback((player) => {
    if (selectedSlot) {
      assignPlayerToSlot(player);
    } else {
      setSelectedPlayer(selectedPlayer?.id === player.id ? null : player);
    }
  }, [selectedSlot, selectedPlayer, assignPlayerToSlot]);

  const pitchStartingPlayers = useMemo(() => {
    return startingPlayers;
  }, [startingPlayers]);

  const handleFinishLineup = useCallback(() => {
    if (!isLineupComplete) {
      const missingSlots = formationData.positions
        .filter(
          (slot) => !startingPlayers.find((sp) => sp.positionId === slot.id)
        )
        .map((slot) => slot.name);

      alert(
        `Cannot finish lineup: you still need to fill these slots: ${missingSlots.join(', ')}`
      );
      return;
    }

    const lineupData = {
      teamId: team.id,
      teamName: team.name,
      formation: selectedFormation,
      startingPlayers: [...startingPlayers],
      substitutePlayers: [...substitutePlayers],
      createdAt: new Date().toISOString(),
    };

    onSave(lineupData);
  }, [isLineupComplete, formationData.positions, startingPlayers, team, selectedFormation, substitutePlayers, onSave]);

  const handleResetLineup = useCallback(() => {
    if (
      window.confirm(
        'Are you sure you want to reset your entire lineup? This cannot be undone.'
      )
    ) {
      setStartingPlayers([]);
      setSubstitutePlayers([]);
      setSelectedSlot(null);
      setSelectedPlayer(null);
    }
  }, []);

  return (
    <div className="team-builder-container">
      <div className="builder-header">
        <div className="team-info">
          <TeamCrest team={team} size={64} />
          <div className="team-details">
            <h2>{team.name}</h2>
            <p>Build your starting XI and substitutes</p>
          </div>
        </div>

        <div className="formation-selector">
          <label htmlFor="formation">Formation:</label>
          <select
            id="formation"
            value={selectedFormation}
            onChange={(e) => setSelectedFormation(e.target.value)}
            className="formation-dropdown"
          >
            {formations.map((form) => (
              <option key={form.value} value={form.value}>
                {form.label} - {form.description}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="selection-counters">
        <div
          className={`counter ${startingCount === 11 ? 'complete' : 'incomplete'}`}
        >
          <span className="counter-label">Starting XI:</span>
          <span className="counter-value">{startingCount}/11</span>
        </div>
        <div
          className={`counter ${substituteCount === 5 ? 'complete' : 'incomplete'}`}
        >
          <span className="counter-label">Substitutes:</span>
          <span className="counter-value">{substituteCount}/5</span>
        </div>
        <div
          className={`lineup-status ${isLineupComplete ? 'ready' : 'incomplete'}`}
        >
          {startingCount === 0 && !team && (
            <span>👆 Select a team first to begin building your lineup</span>
          )}
          {team && startingCount === 0 && (
            <span>📋 Choose 11 starters from the available players list</span>
          )}
          {team && startingCount > 0 && !isLineupComplete && (
            <span>
              ⏳ Lineup incomplete - add {11 - startingCount} more player
              {11 - startingCount > 1 ? 's' : ''}
            </span>
          )}
          {team && isLineupComplete && (
            <span>
              ✅ Starting XI ready! You can still adjust positions or add
              substitutes
            </span>
          )}
        </div>
      </div>

      {selectedPlayer && (
        <div className="selected-player-actions">
          <div className="selected-player-info">
            <span>Selected: <strong>{selectedPlayer.name}</strong></span>
          </div>
          <button
            className="action-btn add-starting-btn"
            onClick={addToStartingLineup}
            disabled={!canAddStarter}
          >
            Add to Starting Lineup
          </button>
          <button
            className="action-btn add-sub-btn"
            onClick={addToSubstitutes}
            disabled={!canAddSubstitute}
          >
            Add to Substitutes
          </button>
        </div>
      )}

      <div className="builder-content">
        <div className="left-panel">
          <div className="pitch-section">
            <FootballPitch
              formation={selectedFormation}
              startingPlayers={pitchStartingPlayers}
              substitutes={substitutePlayers}
              onPlayerSelect={handlePitchSlotClick}
              isEditable={isEditable}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              dragOverSlot={dragOverSlot}
              onPlayerDragStart={handleDragStart}
              onPlayerDragEnd={handleDragEnd}
              selectedSlot={selectedSlot}
            />
          </div>

          <div className="substitutes-section-fixed">
            <h3>🔄 Substitutes ({substitutePlayers.length}/5)</h3>
            <div className="substitutes-grid-fixed">
              {Array(5)
                .fill(null)
                .map((_, index) => {
                  const subPlayer = substitutePlayers[index];
                  const slotId = `sub-${index}`;
                  const isDragOver = dragOverSlot === slotId;
                  return (
                    <div
                      key={slotId}
                      className={`substitute-card-fixed ${subPlayer ? 'filled' : 'empty'} ${isDragOver ? 'drag-over' : ''}`}
                      onDragOver={(e) => handleDragOver(e, slotId)}
                      onDragLeave={handleDragLeave}
                      onDrop={() => handleDrop(slotId)}
                    >
                      {subPlayer ? (
                        <>
                          <div
                            className="draggable-player"
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move';
                              handleDragStart(subPlayer, 'substitute', index);
                            }}
                            onDragEnd={handleDragEnd}
                          >
                            <PlayerImage
                              player={subPlayer}
                              size={36}
                              manualUploadEnabled={isEditable}
                            />
                          </div>
                          <span className="substitute-name">
                            {subPlayer.name}
                          </span>
                          <span className="substitute-position">
                            {subPlayer.position}
                          </span>
                          <button
                            className="remove-sub-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              removePlayerFromSlot(slotId, true);
                            }}
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <span className="empty-slot-text">Empty</span>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        <div className="right-panel">
          <div className="players-panel">
            <div className="tab-header">
              <button
                className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
                onClick={() => setActiveTab('available')}
              >
                Available Players ({availablePlayers.length})
              </button>
              <button
                className={`tab-btn ${activeTab === 'starting' ? 'active' : ''}`}
                onClick={() => setActiveTab('starting')}
              >
                Starting ({startingCount})
              </button>
              <button
                className={`tab-btn ${activeTab === 'substitutes' ? 'active' : ''}`}
                onClick={() => setActiveTab('substitutes')}
              >
                Subs ({substituteCount})
              </button>
            </div>

            <div className="tab-content">
              {selectedSlot && activeTab === 'available' && (
                <div className="selected-slot-info">
                  <p>
                    Select a player to assign to:{' '}
                    <strong>{selectedSlot}</strong>
                  </p>
                  <button
                    onClick={() => setSelectedSlot(null)}
                    className="cancel-selection-btn"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {activeTab === 'available' && (
                <div className="available-players-list">
                  <input
                    type="text"
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="player-search"
                  />
                  {availablePlayers.length === 0 ? (
                    <p className="no-players">
                      {selectedSlot
                        ? 'No available players to assign'
                        : 'All players have been selected'}
                    </p>
                  ) : (
                    availablePlayers.map((player, index) => (
                      <div
                        key={player.id}
                        className={`available-player-card ${selectedSlot ? 'selectable' : ''} ${selectedPlayer?.id === player.id ? 'selected' : ''} ${draggedPlayer?.player?.id === player.id ? 'dragging' : ''}`}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          handleDragStart(player, 'available', index);
                        }}
                        onDragEnd={handleDragEnd}
                        onClick={() => handlePlayerCardClick(player)}
                      >
                        <div className="player-image-container">
                          <PlayerImage
                            player={player}
                            size={40}
                            manualUploadEnabled={isEditable}
                          />
                        </div>
                        <div className="player-info">
                          <h4>{player.name}</h4>
                          <p>{player.position || 'Position unknown'}</p>
                        </div>
                        {selectedSlot && (
                          <button className="assign-btn">Assign</button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'starting' && (
                <div className="starting-players-list">
                  {formationData.positions.map((slot, index) => {
                    const assignedPlayer = startingPlayers.find(
                      (sp) => sp.positionId === slot.id
                    )?.player;
                    const sourceIndex = startingPlayers.findIndex(
                      (sp) => sp.positionId === slot.id
                    );
                    const isDragOver = dragOverSlot === slot.id;
                    return (
                      <div
                        key={slot.id}
                        className={`starting-player-row ${assignedPlayer ? 'filled' : 'empty'} ${isDragOver ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, slot.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={() => handleDrop(slot.id)}
                      >
                        <span className="slot-name">{slot.name}</span>
                        {assignedPlayer ? (
                          <div
                            className="draggable-player"
                            draggable={true}
                            onDragStart={(e) => {
                              e.dataTransfer.effectAllowed = 'move';
                              handleDragStart(
                                assignedPlayer,
                                'starting',
                                sourceIndex
                              );
                            }}
                            onDragEnd={handleDragEnd}
                          >
                            <div className="player-image-container">
                              <PlayerImage
                                player={assignedPlayer}
                                size={36}
                                manualUploadEnabled={isEditable}
                              />
                            </div>
                            <div className="assigned-player-info">
                              <h4>{assignedPlayer.name}</h4>
                              <p>{assignedPlayer.position}</p>
                            </div>
                            <button
                              className="remove-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePlayerFromSlot(slot.id);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <span className="empty-slot-text">
                            Drop player here
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'substitutes' && (
                <div className="substitutes-list">
                  {Array(5)
                    .fill(null)
                    .map((_, index) => {
                      const subPlayer = substitutePlayers[index];
                      const slotId = `sub-${index}`;
                      const isDragOver = dragOverSlot === slotId;
                      return (
                        <div
                          key={slotId}
                          className={`substitute-row ${subPlayer ? 'filled' : 'empty'} ${isDragOver ? 'drag-over' : ''}`}
                          onDragOver={(e) => handleDragOver(e, slotId)}
                          onDragLeave={handleDragLeave}
                          onDrop={() => handleDrop(slotId)}
                        >
                          <span className="slot-number">Sub {index + 1}</span>
                          {subPlayer ? (
                            <div
                              className="draggable-player"
                              draggable={true}
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'move';
                                handleDragStart(subPlayer, 'substitute', index);
                              }}
                              onDragEnd={handleDragEnd}
                            >
                              <div className="player-image-container">
                                <PlayerImage
                                  player={subPlayer}
                                  size={36}
                                  manualUploadEnabled={isEditable}
                                />
                              </div>
                              <div className="sub-player-info">
                                <h4>{subPlayer.name}</h4>
                                <p>{subPlayer.position}</p>
                              </div>
                              <button
                                className="remove-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePlayerFromSlot(slotId, true);
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <span className="empty-slot-text">
                              Drop player here
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="builder-actions">
        <button className="reset-btn" onClick={handleResetLineup}>
          Reset Lineup
        </button>
        <button className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button
          className={`finish-btn ${isLineupComplete ? 'enabled' : 'disabled'}`}
          onClick={handleFinishLineup}
          disabled={!isLineupComplete}
        >
          {isLineupComplete
            ? 'Finish Lineup'
            : `Complete Starting XI (${startingCount}/11)`}
        </button>
      </div>
    </div>
  );
};

export default TeamBuilder;