import React from 'react';
import PlayerCard from './PlayerCard';
import { POSITION_CATEGORIES } from '../utils/positionUtils';

const SquadSection = ({
  groupedPlayers,
  filteredPlayers,
  selectedPlayers,
  onToggle,
  isTeamA,
  search,
  setSearch,
  positionFilter,
  setPositionFilter,
  selectAll,
  deselectAll,
  teamName,
  totalPlayers,
}) => {
  const allSelected =
    filteredPlayers.length > 0 &&
    filteredPlayers.every((p) => selectedPlayers.has(p.id));

  return (
    <div className="squad-section">
      <h3>{teamName}</h3>
      <div className="selection-controls">
        <button
          className="control-btn"
          onClick={() => selectAll(filteredPlayers, isTeamA)}
          disabled={allSelected}
        >
          Select All
        </button>
        <button
          className="control-btn"
          onClick={() => deselectAll(isTeamA)}
          disabled={selectedPlayers.size === 0}
        >
          Deselect All
        </button>
        <span className="selected-count">
          Selected: {selectedPlayers.size}/{totalPlayers}
        </span>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="player-search"
        />
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="position-filter"
        >
          <option value="ALL">All Positions</option>
          <option value="GOALKEEPER">Goalkeepers</option>
          <option value="DEFENDER">Defenders</option>
          <option value="MIDFIELDER">Midfielders</option>
          <option value="FORWARD">Forwards</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {Object.entries(groupedPlayers).map(([position, players]) => {
        const filteredPositionPlayers = players.filter((p) =>
          filteredPlayers.includes(p)
        );
        if (filteredPositionPlayers.length === 0) return null;

        return (
          <div key={position} className="position-group">
            <h4>
              {position}s ({filteredPositionPlayers.length})
            </h4>
            <div className="players-grid">
              {filteredPositionPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  isSelected={selectedPlayers.has(player.id)}
                  onToggle={onToggle}
                  isTeamA={isTeamA}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SquadSection;
