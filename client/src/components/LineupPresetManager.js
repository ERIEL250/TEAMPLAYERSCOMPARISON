import React from 'react';
import { useAppContext } from '../contexts/AppContext';

function LineupPresetManager({ onLoadPreset }) {
  const { state, dispatch } = useAppContext();
  const { lineupPresets } = state;

  const handleSavePreset = () => {
    const name = prompt('Enter a name for this lineup preset:');
    if (name) {
      const preset = {
        name,
        timestamp: Date.now(),
        teamALineup: state.teamALineup,
        teamBLineup: state.teamBLineup,
        teamA: state.teamA,
        teamB: state.teamB,
        selectedCompetition: state.selectedCompetition,
      };
      dispatch({ type: 'SAVE_LINEUP_PRESET', payload: preset });
    }
  };

  const handleDeletePreset = (index) => {
    if (window.confirm('Are you sure you want to delete this preset?')) {
      dispatch({ type: 'DELETE_LINEUP_PRESET', payload: index });
    }
  };

  const handleLoadPreset = (preset) => {
    if (
      window.confirm(
        'Load this preset? This will replace your current lineups.'
      )
    ) {
      dispatch({
        type: 'SET_SELECTED_COMPETITION',
        payload: preset.selectedCompetition,
      });
      dispatch({ type: 'SET_TEAM_A', payload: preset.teamA });
      dispatch({ type: 'SET_TEAM_B', payload: preset.teamB });
      dispatch({ type: 'SET_TEAM_A_LINEUP', payload: preset.teamALineup });
      dispatch({ type: 'SET_TEAM_B_LINEUP', payload: preset.teamBLineup });
      if (onLoadPreset) onLoadPreset(preset);
    }
  };

  const handleExportPresets = () => {
    const dataStr = JSON.stringify(lineupPresets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lineup-presets-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPresets = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            imported.forEach((preset) => {
              dispatch({ type: 'SAVE_LINEUP_PRESET', payload: preset });
            });
            alert(`Successfully imported ${imported.length} preset(s)!`);
          } else {
            alert('Invalid preset file format');
          }
        } catch (err) {
          alert('Error importing presets: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="preset-manager">
      <div className="preset-manager-header">
        <h3>Lineup Presets</h3>
        <div className="preset-actions">
          <button onClick={handleSavePreset} className="save-preset-btn">
            Save Current Lineup
          </button>
          <button onClick={handleExportPresets} className="export-preset-btn">
            Export All
          </button>
          <label className="import-preset-btn">
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImportPresets}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      {lineupPresets.length === 0 ? (
        <p className="no-presets">
          No saved presets yet. Save a lineup to get started!
        </p>
      ) : (
        <div className="presets-list">
          {lineupPresets.map((preset, index) => (
            <div key={index} className="preset-card">
              <div className="preset-info">
                <h4>{preset.name}</h4>
                <p className="preset-date">
                  {new Date(preset.timestamp).toLocaleString()}
                </p>
                {preset.teamA && preset.teamB && (
                  <p className="preset-teams">
                    {preset.teamA.name} vs {preset.teamB.name}
                  </p>
                )}
              </div>
              <div className="preset-card-actions">
                <button
                  onClick={() => handleLoadPreset(preset)}
                  className="load-preset-btn"
                >
                  Load
                </button>
                <button
                  onClick={() => handleDeletePreset(index)}
                  className="delete-preset-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LineupPresetManager;
