import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import TeamCrest from './TeamCrest';
import PlayerImage from './PlayerImage';
import { getAvailableFormations, getFormation } from '../utils/formations';
import './BestXISelector.css';

const STORAGE_KEY = 'best-xi-lineup';

const BestXISelector = () => {
  const { state, dispatch } = useAppContext();
  const { teamA, teamB, teamAPlayers, teamBPlayers } = state;
  
  const [selectedFormation, setSelectedFormation] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.formation || '4-3-3';
      }
    } catch (e) {
      console.error('Error loading saved lineup:', e);
    }
    return '4-3-3';
  });
  
  const [bestXIPlayers, setBestXIPlayers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.startingPlayers || [];
      }
    } catch (e) {
      console.error('Error loading saved lineup:', e);
    }
    return [];
  });
  
  const [substitutePlayers, setSubstitutePlayers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.substitutePlayers || [];
      }
    } catch (e) {
      console.error('Error loading saved lineup:', e);
    }
    return [];
  });
  
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);
  const [draggedPlayer, setDraggedPlayer] = useState(null);
  const [dragOverSlot, setDragOverSlot] = useState(null);

  useEffect(() => {
    try {
      const lineupToSave = {
        formation: selectedFormation,
        startingPlayers: bestXIPlayers,
        substitutePlayers,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lineupToSave));
    } catch (e) {
      console.error('Error saving lineup:', e);
    }
  }, [selectedFormation, bestXIPlayers, substitutePlayers]);

  const allPlayers = useMemo(() => {
    const playersWithTeam = [
      ...teamAPlayers.map((p) => ({
        ...p,
        teamId: teamA.id,
        teamName: teamA.name,
        teamCrest: teamA.crest,
      })),
      ...teamBPlayers.map((p) => ({
        ...p,
        teamId: teamB.id,
        teamName: teamB.name,
        teamCrest: teamB.crest,
      })),
    ];
    return playersWithTeam;
  }, [teamAPlayers, teamBPlayers, teamA, teamB]);

  const formationOptions = getAvailableFormations();
  const formations = formationOptions.map((f) => f.value);
  const formationData = getFormation(selectedFormation);

  const selectedPlayerIds = useMemo(() => {
    const ids = new Set();
    bestXIPlayers.forEach((sp) => {
      if (sp.player) ids.add(sp.player.id);
    });
    substitutePlayers.forEach((sp) => ids.add(sp.id));
    return ids;
  }, [bestXIPlayers, substitutePlayers]);

  const availablePlayers = useMemo(() => {
    return allPlayers.filter((player) => !selectedPlayerIds.has(player.id));
  }, [allPlayers, selectedPlayerIds]);

  const groupedAvailablePlayers = useMemo(() => {
    const groups = {
      GK: [],
      DEF: [],
      MID: [],
      FWD: [],
    };
    availablePlayers.forEach((player) => {
      const position = player.position || 'Unknown';
      if (position.includes('Goalkeeper') || position === 'GK') {
        groups.GK.push(player);
      } else if (
        position.includes('Back') ||
        position.includes('Defender') ||
        position === 'DEF'
      ) {
        groups.DEF.push(player);
      } else if (position.includes('Midfielder') || position === 'MID') {
        groups.MID.push(player);
      } else if (
        position.includes('Forward') ||
        position.includes('Striker') ||
        position === 'FWD'
      ) {
        groups.FWD.push(player);
      } else {
        groups.DEF.push(player);
      }
    });
    return groups;
  }, [availablePlayers]);

  const handleAddToBestXI = useCallback((player, positionId) => {
    setBestXIPlayers((prev) => {
      const existing = prev.find((sp) => sp.positionId === positionId);
      if (existing) {
        return prev.map((sp) =>
          sp.positionId === positionId ? { ...sp, player } : sp
        );
      }
      return [...prev, { positionId, player }];
    });
  }, []);

  const handleRemoveFromBestXI = useCallback((positionId) => {
    setBestXIPlayers((prev) =>
      prev.filter((sp) => sp.positionId !== positionId)
    );
  }, []);

  const handleAddSubstitute = useCallback((player) => {
    setSubstitutePlayers((prev) => [...prev, player]);
  }, []);

  const handleRemoveSubstitute = useCallback((playerId) => {
    setSubstitutePlayers((prev) => prev.filter((p) => p.id !== playerId));
  }, []);

  const handleClearBestXI = useCallback(() => {
    setBestXIPlayers([]);
    setSubstitutePlayers([]);
  }, []);

  const handleDragStart = useCallback((player, sourceType) => {
    setDraggedPlayer({ ...player, sourceType });
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedPlayer(null);
    setDragOverSlot(null);
  }, []);

  const handleDragOver = useCallback((e, slotId) => {
    e.preventDefault();
    setDragOverSlot(slotId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverSlot(null);
  }, []);

  const handleDrop = useCallback((e, targetSlotId) => {
    e.preventDefault();
    if (!draggedPlayer) return;

    if (draggedPlayer.sourceType === 'pitch') {
      const sourceSlotId = draggedPlayer.sourceSlotId;
      if (sourceSlotId === targetSlotId) {
        handleDragEnd();
        return;
      }
      
      setBestXIPlayers((prev) => {
        const sourcePlayer = prev.find(sp => sp.positionId === sourceSlotId);
        const targetPlayer = prev.find(sp => sp.positionId === targetSlotId);
        
        const newPlayers = prev.filter(sp => sp.positionId !== sourceSlotId && sp.positionId !== targetSlotId);
        
        if (targetPlayer) {
          newPlayers.push({ positionId: sourceSlotId, player: targetPlayer.player });
        }
        if (sourcePlayer) {
          newPlayers.push({ positionId: targetSlotId, player: sourcePlayer.player });
        }
        
        return newPlayers;
      });
    } else if (draggedPlayer.sourceType === 'available') {
      handleAddToBestXI(draggedPlayer, targetSlotId);
    } else if (draggedPlayer.sourceType === 'substitute') {
      handleAddToBestXI(draggedPlayer, targetSlotId);
      setSubstitutePlayers((prev) => prev.filter(p => p.id !== draggedPlayer.id));
    }
    
    handleDragEnd();
  }, [draggedPlayer, handleAddToBestXI, handleDragEnd]);

  const handleSaveBestXI = useCallback(() => {
    const bestXILineup = {
      formation: selectedFormation,
      startingPlayers: bestXIPlayers,
      substitutePlayers,
      fromTeams: [teamA.id, teamB.id],
    };
    dispatch({
      type: 'SET_BEST_XI_LINEUP',
      payload: bestXILineup,
    });
    alert('Best XI saved! You can view it in the comparison view.');
  }, [
    bestXIPlayers,
    substitutePlayers,
    selectedFormation,
    teamA,
    teamB,
    dispatch,
  ]);

  const startingCount = bestXIPlayers.filter((sp) => sp.player).length;
  const isLineupComplete = startingCount === 11;

  return (
    <div className="best-xi-selector">
      <div className="best-xi-header">
        <h2>🌟 Build Best XI from Both Teams</h2>
        <p>
          Select the best players from both teams to form your ultimate dream
          team
        </p>
        <div className="team-crests">
          <TeamCrest team={teamA} size={60} />
          <span className="vs">VS</span>
          <TeamCrest team={teamB} size={60} />
        </div>
      </div>

      <div className="best-xi-content-wrapper">
        <div className="best-xi-left-column">
          <div className="best-xi-pitch">
            <h3>Best XI Pitch ({startingCount}/11 players)</h3>
            <div className="pitch-center-circle"></div>
            <div className="pitch-center-dot"></div>
            <div className="pitch-penalty-area-top"></div>
            <div className="pitch-penalty-area-bottom"></div>
            <div className="pitch-goal-area-top"></div>
            <div className="pitch-goal-area-bottom"></div>
            <div className="pitch-slots">
          {formationData.positions.map((slot) => {
            const assignedPlayer = bestXIPlayers.find(
              (sp) => sp.positionId === slot.id
            )?.player;
            return (
              <div
                key={slot.id}
                className={`pitch-slot ${assignedPlayer ? 'filled' : 'empty'} ${dragOverSlot === slot.id ? 'drag-over' : ''}`}
                style={{
                  left: `${slot.x}%`,
                  top: `${slot.y}%`,
                }}
                onDragOver={(e) => handleDragOver(e, slot.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot.id)}
              >
                {assignedPlayer ? (
                  <div 
                    className="slot-player"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move';
                      handleDragStart({ ...assignedPlayer, sourceSlotId: slot.id }, 'pitch');
                    }}
                    onDragEnd={handleDragEnd}
                  >
                    <PlayerImage
                      player={assignedPlayer}
                      size={50}
                      manualUploadEnabled={true}
                    />
                    <span className="slot-player-name">
                      {assignedPlayer.name}
                    </span>
                    <button
                      className="remove-player-btn"
                      onClick={() => handleRemoveFromBestXI(slot.id)}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="slot-empty">
                    <span>{slot.name}</span>
                    <p>Drag a player here</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
          </div>

          <div className="substitutes-section">
            <h3>🔄 Substitutes ({substitutePlayers.length})</h3>
            <div className="substitutes-grid">
              {substitutePlayers.map((player) => (
                <div 
                  key={player.id} 
                  className="substitute-card"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'copy';
                    handleDragStart(player, 'substitute');
                  }}
                  onDragEnd={handleDragEnd}
                >
                  <PlayerImage
                    player={player}
                    size={40}
                    manualUploadEnabled={true}
                  />
                  <div className="substitute-info">
                    <span className="substitute-name">{player.name}</span>
                    <span className="substitute-position">{player.position}</span>
                  </div>
                  <button
                    className="substitute-remove-btn"
                    onClick={() => handleRemoveSubstitute(player.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="best-xi-right-column">
          <div className="formation-selector">
            <label>Choose Formation:</label>
            <select
              value={selectedFormation}
              onChange={(e) => setSelectedFormation(e.target.value)}
            >
              {formations.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <button className="clear-lineup-btn" onClick={handleClearBestXI}>
              🗑️ Clear Saved Lineup
            </button>
          </div>

          <div className="available-players-section">
            <div className="section-header">
              <h3>Available Players ({availablePlayers.length})</h3>
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                />
                Show only available positions
              </label>
            </div>

            <div className="players-grid">
              {Object.entries(groupedAvailablePlayers).map(
                ([position, players]) => (
                  <div key={position} className="position-group">
                    <h4>
                      {position} ({players.length})
                    </h4>
                    <div className="players-list">
                      {players.map((player) => (
                        <div 
                          key={player.id} 
                          className="player-card-small"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = 'copy';
                            handleDragStart(player, 'available');
                          }}
                          onDragEnd={handleDragEnd}
                        >
                          <PlayerImage
                            player={player}
                            size={40}
                            manualUploadEnabled={true}
                          />
                          <div className="player-info-small">
                            <span className="player-name-small">{player.name}</span>
                            <span className="player-team-small">
                              {player.teamName}
                            </span>
                          </div>
                          <button
                            className="add-to-bestxi-btn"
                            onClick={() => {
                              const emptySlot = formationData.positions.find(
                                (slot) =>
                                  !bestXIPlayers.some(
                                    (sp) => sp.positionId === slot.id
                                  )
                              );
                              if (emptySlot) {
                                handleAddToBestXI(player, emptySlot.id);
                              }
                            }}
                          >
                            + Start
                          </button>
                          <button
                            className="add-substitute-btn"
                            onClick={() => handleAddSubstitute(player)}
                          >
                            + Sub
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button className="clear-btn" onClick={handleClearBestXI}>
              Clear All
            </button>
            <button
              className="save-btn"
              onClick={handleSaveBestXI}
              disabled={!isLineupComplete}
            >
              Save Best XI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestXISelector;