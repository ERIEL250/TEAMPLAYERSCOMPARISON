import React from 'react';
import CompetitionLogo from './CompetitionLogo';

const CompetitionSelector = ({
  competitions,
  selectedCompetition,
  onSelect,
  loading,
}) => {
  return (
    <section className="section competition-selector">
      <h2>1. Select a Competition</h2>
      <div className="competition-header">
        {selectedCompetition &&
          competitions.find((c) => c.code === selectedCompetition) && (
            <CompetitionLogo
              competition={competitions.find(
                (c) => c.code === selectedCompetition
              )}
              size={80}
            />
          )}
        <select
          value={selectedCompetition}
          onChange={(e) => onSelect(e.target.value)}
          className="select-input"
          disabled={loading}
        >
          <option value="">-- Choose a competition --</option>
          {competitions.map((comp) => (
            <option key={comp.code} value={comp.code}>
              {comp.name} ({comp.area?.name})
            </option>
          ))}
        </select>
      </div>
      {loading && <span className="loading">Loading teams...</span>}
    </section>
  );
};

export default CompetitionSelector;
