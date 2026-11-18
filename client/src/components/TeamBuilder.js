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
  const [activeTab, setActiveTab] = useState('available'); // available, starting, substitutes
  const [selectedFormation, setSelectedFormation] = useState('4-3-3');
  const [startingPlayers, setStartingPlayers] = useState([]); // Array of { positionId, player }
  const [substitutePlayers, setSubstitutePlayers] = useState([]); // Array of players
  const [selectedSlot, setSelectedSlot] = useState(null); // Currently selected slot to fill
  const [searchQuery, setSearchQuery] = useState('');
  // Drag and drop state
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);
  // Player images are now managed centrally by the PlayerImage component and sportsDBService
  // TeamBuilder is always editable since it's used to create/edit lineups
  const isEditable = true;

  const formations = getAvailableFormations();
  const formationData = getFormation(selectedFormation);

  // Load saved lineup if provided
  useEffect(() => {
    if (savedLineup) {
      setSelectedFormation(savedLineup.formation || '4-3-3');
      setStartingPlayers(savedLineup.startingPlayers || []);
      setSubstitutePlayers(savedLineup.substitutePlayers || []);
    }
  }, [savedLineup]);

  // Get all players that are already selected (either starting or substitute)
  const selectedPlayerIds = useMemo(() => {
    const ids = new Set();
    startingPlayers.forEach((sp) => {
      if (sp.player) ids.add(sp.player.id);
    });
    substitutePlayers.forEach((sp) => ids.add(sp.id));
    return ids;
  }, [startingPlayers, substitutePlayers]);

  // Filter available players (not already selected)
  const availablePlayers = useMemo(() => {
    return allPlayers.filter(
      (player) =>
        !selectedPlayerIds.has(player.id) &&
        player.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allPlayers, selectedPlayerIds, searchQuery]);

  // Counters for UI display
  const startingCount = startingPlayers.filter((sp) => sp.player).length;
  const substituteCount = substitutePlayers.length;
  const canAddStarter = startingCount < 11;

  // Check if lineup is complete
  const isLineupComplete = startingCount === 11;

  // Manual image upload is now handled centrally by the PlayerImage component

  // Player images are now automatically loaded by the PlayerImage component when rendered

  // Drag and drop handlers
  const handleDragStart = useCallback(
    (player, sourceType, sourceIndex) => {
      // Store the source position ID if dragging from a starting slot
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

      // First check if target slot is occupied and confirm swap if needed
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

      // If slot is occupied, ask user for confirmation
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

      // Handle drop onto starting slot
      if (isStartingTarget) {
        let newStarters = [...startingPlayers];

        // Remove the dragged player from their current position if they were already in starting lineup
        if (sourceType === 'starting') {
          newStarters.splice(sourceIndex, 1);
        } else if (sourceType === 'substitute') {
          // Remove from substitutes
          const newSubs = [...substitutePlayers];
          newSubs.splice(sourceIndex, 1);
          setSubstitutePlayers(newSubs);
        }

        // Check if target slot has an existing player to swap
        const existingTargetIndex = newStarters.findIndex(
          (sp) => sp.positionId === targetSlot
        );
        if (existingTargetIndex >= 0) {
          // The existing player at target slot needs to go to the source if dragging from another starting slot
          if (sourceType === 'starting') {
            // We were dragging from another starting slot, swap positions
            const sourceOriginalIndex = newStarters.findIndex(
              (sp) => sp.positionId === draggedPlayer.sourcePositionId
            );
            if (sourceOriginalIndex >= 0) {
              // Actually add the existing player to the source position
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
            // Just replace the existing player - they return to available pool
            newStarters = newStarters.filter(
              (sp) => sp.positionId !== targetSlot
            );
          }
        }

        // Add the dragged player to the new target slot
        newStarters.push({ positionId: targetSlot, player });
        setStartingPlayers(newStarters);
      } else {
        // Handle drop onto substitute slot
        const subIndex = parseInt(targetSlot.split('-')[1]);
        if (subIndex >= 0 && subIndex < 5) {
          let newSubs = [...substitutePlayers];
          let newStarters = [...startingPlayers];

          // Remove from source
          if (sourceType === 'starting') {
            // Remove from starting lineup
            newStarters.splice(sourceIndex, 1);
            setStartingPlayers(newStarters);
          } else if (sourceType === 'substitute') {
            // Remove from current substitute position
            newSubs.splice(sourceIndex, 1);
          }

          // Check if there's an existing player to swap in this substitute slot
          if (newSubs[subIndex]) {
            // If we're swapping between substitutes, handle the swap
            if (sourceType === 'substitute') {
              const existingPlayer = newSubs[subIndex];
              newSubs.splice(subIndex, 1);
              newSubs.splice(
                sourceIndex > subIndex ? sourceIndex : sourceIndex,
                0,
                existingPlayer
              );
            } else {
              // Remove existing player to make room
              newSubs.splice(subIndex, 1);
            }
          }

          // Add the dragged player to the new substitute slot
          newSubs.splice(subIndex, 0, player);
          setSubstitutePlayers(newSubs.slice(0, 5));
        }
      }

      setDraggedPlayer(null);
      setDragOverSlot(null);
    },
    [draggedPlayer, startingPlayers, substitutePlayers]
  );

  // Handle selecting a player to assign to a slot
  const assignPlayerToSlot = (player) => {
    if (!selectedSlot) return;

    // Check if it's a starting slot or substitute slot
    if (selectedSlot.startsWith('sub-')) {
      const subIndex = parseInt(selectedSlot.split('-')[1]);
      if (subIndex >= 0 && subIndex < 5) {
        const newSubs = [...substitutePlayers];
        // If slot already has a player, remove them first
        if (newSubs[subIndex]) {
          const existingId = newSubs[subIndex].id;
          const playerToReturn = allPlayers.find((p) => p.id === existingId);
          if (playerToReturn) {
            // Remove existing player from substitutes
            newSubs.splice(subIndex, 1);
          }
        }
        // Add new player to substitute slot
        newSubs.splice(subIndex, 0, player);
        // Ensure we only keep max 5 substitutes
        setSubstitutePlayers(newSubs.slice(0, 5));
      }
    } else {
      // It's a starting slot - check if we can add another starter
      if (
        !canAddStarter &&
        !startingPlayers.find((sp) => sp.positionId === selectedSlot)
      ) {
        return; // Cannot add more than 11 starters
      }

      // Check if this slot already has a player, if so remove them
      const existingIndex = startingPlayers.findIndex(
        (sp) => sp.positionId === selectedSlot
      );
      const newStarters = [...startingPlayers];

      if (existingIndex >= 0) {
        newStarters.splice(existingIndex, 1);
      }

      // Add the new player to this slot
      newStarters.push({ positionId: selectedSlot, player });
      setStartingPlayers(newStarters);
    }

    setSelectedSlot(null); // Clear selection after assignment
  };

  // Remove a player from a slot
  const removePlayerFromSlot = (positionId, isSubstitute = false) => {
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
  };

  // Handle pitch slot click
  const handlePitchSlotClick = (slotId, currentPlayer) => {
    if (currentPlayer) {
      // If slot has a player, offer to remove them
      const isSub = slotId.startsWith('sub-');
      if (window.confirm(`Remove ${currentPlayer.name} from this slot?`)) {
        removePlayerFromSlot(slotId, isSub);
      }
    } else {
      // If slot is empty, select it to assign a player
      setSelectedSlot(slotId);
      setActiveTab('available'); // Switch to available players tab
    }
  };

  // Pass the actual startingPlayers array (with positionId links) to FootballPitch
  // DO NOT filter or transform - FootballPitch needs the { positionId, player } structure
  const pitchStartingPlayers = useMemo(() => {
    return startingPlayers;
  }, [startingPlayers]);

  // Finish and save the lineup
  const handleFinishLineup = () => {
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

    // Save the lineup data
    const lineupData = {
      teamId: team.id,
      teamName: team.name,
      formation: selectedFormation,
      startingPlayers: [...startingPlayers],
      substitutePlayers: [...substitutePlayers],
      createdAt: new Date().toISOString(),
    };

    onSave(lineupData);
  };

  // Reset the entire lineup
  const handleResetLineup = () => {
    if (
      window.confirm(
        'Are you sure you want to reset your entire lineup? This cannot be undone.'
      )
    ) {
      setStartingPlayers([]);
      setSubstitutePlayers([]);
      setSelectedSlot(null);
    }
  };

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

      {/* Selection counters with status messages */}
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
        {/* Status message that changes based on selection state */}
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

      <div className="builder-content">
        {/* Left panel: Pitch + Fixed Substitutes (always visible, not scrollable) */}
        <div className="left-panel">
          {/* Pitch visualization */}
          <div className="pitch-section">
            <FootballPitch
              formation={selectedFormation}
              startingPlayers={pitchStartingPlayers}
              substitutes={substitutePlayers}
              onPlayerSelect={handlePitchSlotClick}
              isEditable={isEditable}
            />
          </div>

          {/* Fixed substitutes section - always visible under pitch */}
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

        {/* Right panel: Scrollable Players panel with tabs */}
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
                        className={`available-player-card ${selectedSlot ? 'selectable' : ''} ${draggedPlayer?.player?.id === player.id ? 'dragging' : ''}`}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          handleDragStart(player, 'available', index);
                        }}
                        onDragEnd={handleDragEnd}
                        onClick={() =>
                          selectedSlot && assignPlayerToSlot(player)
                        }
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

      {/* Action buttons */}
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
