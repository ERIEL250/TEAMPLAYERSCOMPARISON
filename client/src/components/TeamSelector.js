import React from 'react';
import TeamCrest from './TeamCrest';

const TeamSelector = ({
  teams,
  selectedTeam,
  onSelect,
  searchValue,
  onSearchChange,
  label,
  disabled = false,
  otherTeamId = null,
}) => {
  const filteredTeams = teams.filter(
    (t) =>
      t.name.toLowerCase().includes(searchValue.toLowerCase()) &&
      t.id !== otherTeamId
  );

  return (
    <section className="section team-selector">
      <h2>{label}</h2>
      <div className="team-selector-header">
        {selectedTeam && <TeamCrest team={selectedTeam} size={80} />}
        <input
          type="text"
          placeholder="Search teams..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="team-search"
          disabled={disabled}
        />
        <select
          value={selectedTeam?.id || ''}
          onChange={(e) => {
            const teamId = e.target.value ? parseInt(e.target.value) : null;
            const team = teams.find((t) => t.id === teamId);
            onSelect(team);
          }}
          className="select-input"
          disabled={disabled || (!searchValue && filteredTeams.length === 0)}
        >
          <option value="">-- Choose a team --</option>
          {filteredTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};

export default TeamSelector;
