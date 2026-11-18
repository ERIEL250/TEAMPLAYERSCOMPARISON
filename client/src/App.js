import React, { useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useAppContext } from './contexts/AppContext';
import { competitionService, teamService } from './services/apiService';
import { groupPlayersByPosition, filterPlayers } from './utils/positionUtils';
import { loadFromShareURL } from './utils/shareUtils';
import sportsDBService from './services/sportsDBService';
import CompetitionSelector from './components/CompetitionSelector';
import TeamCrest from './components/TeamCrest';
import SquadSection from './components/SquadSection';
import ScoreChart from './components/ScoreChart';
import DarkModeToggle from './components/DarkModeToggle';
import LineupPresetManager from './components/LineupPresetManager';
import ShareLineupButton from './components/ShareLineupButton';
import './App.css';

const TeamBuilder = lazy(() => import('./components/TeamBuilder'));
const LineupComparison = lazy(() => import('./components/LineupComparison'));
const BestXISelector = lazy(() => import('./components/BestXISelector'));

const LoadingFallback = () => (
  <div className="loading-skeleton">Loading...</div>
);

function App() {
  const { state, dispatch } = useAppContext();
  const {
    competitions,
    selectedCompetition,
    teams,
    teamA,
    teamB,
    teamAPlayers,
    teamBPlayers,
    selectedPlayersA,
    selectedPlayersB,
    playerSearchA,
    playerSearchB,
    positionFilterA,
    positionFilterB,
    loading,
    error,
    searchTeamA,
    searchTeamB,
    appMode,
    teamALineup,
    teamBLineup,
  } = state;

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const data = await competitionService.getCompetitions();
        dispatch({ type: 'SET_COMPETITIONS', payload: data });
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          payload: err.response?.data?.error || 'Failed to load competitions',
        });
      }
    };
    fetchCompetitions();

    const sharedData = loadFromShareURL();
    if (sharedData) {
      if (sharedData.selectedCompetition) {
        dispatch({
          type: 'SET_SELECTED_COMPETITION',
          payload: sharedData.selectedCompetition,
        });
      }
      if (sharedData.teamA) {
        dispatch({ type: 'SET_TEAM_A', payload: sharedData.teamA });
      }
      if (sharedData.teamB) {
        dispatch({ type: 'SET_TEAM_B', payload: sharedData.teamB });
      }
      if (sharedData.teamALineup) {
        dispatch({
          type: 'SET_TEAM_A_LINEUP',
          payload: sharedData.teamALineup,
        });
      }
      if (sharedData.teamBLineup) {
        dispatch({
          type: 'SET_TEAM_B_LINEUP',
          payload: sharedData.teamBLineup,
        });
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (!selectedCompetition) return;

    const fetchTeams = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      try {
        const data = await competitionService.getTeams(selectedCompetition);
        dispatch({ type: 'SET_TEAMS', payload: data });
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          payload:
            err.response?.data?.error ||
            'Failed to load teams for this competition',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchTeams();
  }, [selectedCompetition, dispatch]);

  const loadTeamPlayers = useCallback(
    async (teamId, isTeamA) => {
      try {
        const teamData = await teamService.getTeam(teamId);
        const squad = teamData.squad || [];

        if (isTeamA) {
          dispatch({ type: 'SET_TEAM_A', payload: teamData });
          dispatch({ type: 'SET_TEAM_A_PLAYERS', payload: squad });
          dispatch({ type: 'SET_SELECTED_PLAYERS_A', payload: new Set() });
          dispatch({ type: 'SET_PLAYER_SEARCH_A', payload: '' });
          dispatch({ type: 'SET_POSITION_FILTER_A', payload: 'ALL' });
          sportsDBService.bulkFetchAllPlayerImages(squad, (playerId, url) => {
            console.log(`Loaded image for player ${playerId}:`, url);
          });
        } else {
          dispatch({ type: 'SET_TEAM_B', payload: teamData });
          dispatch({ type: 'SET_TEAM_B_PLAYERS', payload: squad });
          dispatch({ type: 'SET_SELECTED_PLAYERS_B', payload: new Set() });
          dispatch({ type: 'SET_PLAYER_SEARCH_B', payload: '' });
          dispatch({ type: 'SET_POSITION_FILTER_B', payload: 'ALL' });
          sportsDBService.bulkFetchAllPlayerImages(squad, (playerId, url) => {
            console.log(`Loaded image for player ${playerId}:`, url);
          });
        }
      } catch (err) {
        dispatch({
          type: 'SET_ERROR',
          payload: err.response?.data?.error || 'Failed to load team details',
        });
      }
    },
    [dispatch]
  );

  const togglePlayerSelection = useCallback(
    (playerId, isTeamA) => {
      if (isTeamA) {
        dispatch({
          type: 'SET_SELECTED_PLAYERS_A',
          payload: (prev) => {
            const newSet = new Set(prev);
            if (newSet.has(playerId)) {
              newSet.delete(playerId);
            } else {
              newSet.add(playerId);
            }
            return newSet;
          },
        });
      } else {
        dispatch({
          type: 'SET_SELECTED_PLAYERS_B',
          payload: (prev) => {
            const newSet = new Set(prev);
            if (newSet.has(playerId)) {
              newSet.delete(playerId);
            } else {
              newSet.add(playerId);
            }
            return newSet;
          },
        });
      }
    },
    [dispatch]
  );

  const selectAllPlayers = useCallback(
    (players, isTeamA) => {
      const allIds = new Set(players.map((p) => p.id));
      if (isTeamA) {
        dispatch({ type: 'SET_SELECTED_PLAYERS_A', payload: allIds });
      } else {
        dispatch({ type: 'SET_SELECTED_PLAYERS_B', payload: allIds });
      }
    },
    [dispatch]
  );

  const deselectAllPlayers = useCallback(
    (isTeamA) => {
      if (isTeamA) {
        dispatch({ type: 'SET_SELECTED_PLAYERS_A', payload: new Set() });
      } else {
        dispatch({ type: 'SET_SELECTED_PLAYERS_B', payload: new Set() });
      }
    },
    [dispatch]
  );

  const clearTeamSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, [dispatch]);

  const handleSaveTeamALineup = useCallback(
    (lineup) => {
      dispatch({ type: 'SET_TEAM_A_LINEUP', payload: lineup });
      if (teamBLineup) {
        dispatch({ type: 'SET_APP_MODE', payload: 'comparing' });
      } else {
        if (
          window.confirm(
            "Team A lineup saved! Would you like to build Team B's lineup next?"
          )
        ) {
          dispatch({ type: 'SET_APP_MODE', payload: 'building-team-b' });
        } else {
          dispatch({ type: 'SET_APP_MODE', payload: 'selection' });
        }
      }
    },
    [teamBLineup, dispatch]
  );

  const handleSaveTeamBLineup = useCallback(
    (lineup) => {
      dispatch({ type: 'SET_TEAM_B_LINEUP', payload: lineup });
      if (teamALineup) {
        dispatch({ type: 'SET_APP_MODE', payload: 'comparing' });
      } else {
        dispatch({ type: 'SET_APP_MODE', payload: 'selection' });
      }
    },
    [teamALineup, dispatch]
  );

  const handleCancelTeamBuilding = useCallback(() => {
    dispatch({ type: 'SET_APP_MODE', payload: 'selection' });
  }, [dispatch]);

  const handleStartComparison = useCallback(() => {
    if (teamALineup && teamBLineup) {
      dispatch({ type: 'SET_APP_MODE', payload: 'comparing' });
    }
  }, [teamALineup, teamBLineup, dispatch]);

  const teamAGrouped = useMemo(
    () => groupPlayersByPosition(teamAPlayers),
    [teamAPlayers]
  );
  const teamBGrouped = useMemo(
    () => groupPlayersByPosition(teamBPlayers),
    [teamBPlayers]
  );

  const filteredTeamAPlayers = useMemo(
    () => filterPlayers(teamAPlayers, playerSearchA, positionFilterA),
    [teamAPlayers, playerSearchA, positionFilterA]
  );
  const filteredTeamBPlayers = useMemo(
    () => filterPlayers(teamBPlayers, playerSearchB, positionFilterB),
    [teamBPlayers, playerSearchB, positionFilterB]
  );

  const teamASelected = selectedPlayersA.size;
  const teamBSelected = selectedPlayersB.size;
  const totalSelected = teamASelected + teamBSelected;

  const filteredTeamsA = useMemo(
    () =>
      teams.filter((t) =>
        t.name.toLowerCase().includes(searchTeamA.toLowerCase())
      ),
    [teams, searchTeamA]
  );
  const filteredTeamsB = useMemo(
    () =>
      teams.filter(
        (t) =>
          t.name.toLowerCase().includes(searchTeamB.toLowerCase()) &&
          t.id !== teamA?.id
      ),
    [teams, searchTeamB, teamA]
  );

  return (
    <div className={`app ${state.darkMode ? 'dark-mode' : ''}`}>
      <header className="header">
        <h1>⚽ Football Team Comparison</h1>
        <div className="header-actions">
          <ShareLineupButton />
          <DarkModeToggle />
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <main className="main-content">
        <CompetitionSelector
          competitions={competitions}
          selectedCompetition={selectedCompetition}
          onSelect={(code) =>
            dispatch({ type: 'SET_SELECTED_COMPETITION', payload: code })
          }
          loading={loading}
        />

        {teams.length > 0 && (
          <section className="section team-selectors">
            <h2>2. Select Teams to Compare</h2>
            <div className="teams-grid">
              <div className="team-card">
                <h3>Team A</h3>
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchTeamA}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_SEARCH_TEAM_A',
                      payload: e.target.value,
                    })
                  }
                  className="search-input"
                />
                <div className="team-list">
                  {filteredTeamsA.map((team) => (
                    <div
                      key={team.id}
                      className={`team-item ${teamA?.id === team.id ? 'selected' : ''}`}
                      onClick={() => loadTeamPlayers(team.id, true)}
                    >
                      <TeamCrest team={team} size={40} />
                      <span>{team.name}</span>
                    </div>
                  ))}
                </div>
                {teamA && (
                  <div className="selected-team-info">
                    <TeamCrest team={teamA} size={100} />
                    <h4>{teamA.name}</h4>
                    <p>{teamAPlayers.length} players loaded</p>
                    {teamAPlayers.length === 0 && (
                      <p className="warning">
                        Note: This team's squad data is not available via the
                        API
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="team-card">
                <h3>Team B</h3>
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchTeamB}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_SEARCH_TEAM_B',
                      payload: e.target.value,
                    })
                  }
                  className="search-input"
                />
                <div className="team-list">
                  {filteredTeamsB.map((team) => (
                    <div
                      key={team.id}
                      className={`team-item ${teamB?.id === team.id ? 'selected' : ''}`}
                      onClick={() => loadTeamPlayers(team.id, false)}
                    >
                      <TeamCrest team={team} size={40} />
                      <span>{team.name}</span>
                    </div>
                  ))}
                </div>
                {teamB && (
                  <div className="selected-team-info">
                    <TeamCrest team={teamB} size={100} />
                    <h4>{teamB.name}</h4>
                    <p>{teamBPlayers.length} players loaded</p>
                    {teamBPlayers.length === 0 && (
                      <p className="warning">
                        Note: This team's squad data is not available via the
                        API
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {teamA && teamB && appMode === 'selection' && (
          <section className="section team-builder-section">
            <h2>3. Build Your Teams</h2>
            <p>
              Create Starting XI lineups for both teams to compare them on the
              pitch
            </p>

            <div className="build-team-buttons">
              <div className="build-team-card">
                <TeamCrest team={teamA} size={64} />
                <h3>Team A: {teamA.name}</h3>
                {teamALineup ? (
                  <div className="lineup-status">
                    <span className="status-complete">✅ Lineup complete</span>
                    <span>Formation: {teamALineup.formation}</span>
                  </div>
                ) : (
                  <span className="status-incomplete">
                    ❌ No lineup created yet
                  </span>
                )}
                <button
                  className="build-team-btn"
                  onClick={() =>
                    dispatch({
                      type: 'SET_APP_MODE',
                      payload: 'building-team-a',
                    })
                  }
                >
                  {teamALineup ? 'Edit Lineup' : 'Build Team A'}
                </button>
              </div>

              <div className="build-team-card">
                <TeamCrest team={teamB} size={64} />
                <h3>Team B: {teamB.name}</h3>
                {teamBLineup ? (
                  <div className="lineup-status">
                    <span className="status-complete">✅ Lineup complete</span>
                    <span>Formation: {teamBLineup.formation}</span>
                  </div>
                ) : (
                  <span className="status-incomplete">
                    ❌ No lineup created yet
                  </span>
                )}
                <button
                  className="build-team-btn"
                  onClick={() =>
                    dispatch({
                      type: 'SET_APP_MODE',
                      payload: 'building-team-b',
                    })
                  }
                >
                  {teamBLineup ? 'Edit Lineup' : 'Build Team B'}
                </button>
              </div>
            </div>

            {teamALineup && teamBLineup && (
              <button
                className="compare-lineups-btn"
                onClick={handleStartComparison}
              >
                Compare Both Lineups
              </button>
            )}

            {teamA && teamB && (
              <button
                className="best-xi-btn"
                onClick={() =>
                  dispatch({
                    type: 'SET_APP_MODE',
                    payload: 'building-best-xi',
                  })
                }
              >
                🌟 Build Best XI from Both Teams
              </button>
            )}

            <button
              className="clear-selection-btn"
              onClick={clearTeamSelection}
            >
              Clear All Selections & Start New Comparison
            </button>

            <LineupPresetManager />
          </section>
        )}

        {appMode === 'building-team-a' && teamA && (
          <section className="section team-builder-active">
            <Suspense fallback={<LoadingFallback />}>
              <TeamBuilder
                team={teamA}
                allPlayers={teamAPlayers}
                onSave={handleSaveTeamALineup}
                onCancel={handleCancelTeamBuilding}
                savedLineup={teamALineup}
              />
            </Suspense>
          </section>
        )}

        {appMode === 'building-team-b' && teamB && (
          <section className="section team-builder-active">
            <Suspense fallback={<LoadingFallback />}>
              <TeamBuilder
                team={teamB}
                allPlayers={teamBPlayers}
                onSave={handleSaveTeamBLineup}
                onCancel={handleCancelTeamBuilding}
                savedLineup={teamBLineup}
              />
            </Suspense>
          </section>
        )}

        {appMode === 'building-best-xi' && teamA && teamB && (
          <section className="section team-builder-active">
            <Suspense fallback={<LoadingFallback />}>
              <BestXISelector />
            </Suspense>
            <div className="comparison-actions">
              <button
                className="back-to-selection-btn"
                onClick={() =>
                  dispatch({ type: 'SET_APP_MODE', payload: 'selection' })
                }
              >
                Back to Team Selection
              </button>
            </div>
          </section>
        )}

        {appMode === 'comparing' && teamA && teamB && (
          <section className="section comparison-view">
            <Suspense fallback={<LoadingFallback />}>
              <LineupComparison
                teamALineup={teamALineup}
                teamBLineup={teamBLineup}
                teamA={teamA}
                teamB={teamB}
              />
            </Suspense>
            <div className="comparison-actions">
              <button
                className="back-to-selection-btn"
                onClick={() =>
                  dispatch({ type: 'SET_APP_MODE', payload: 'selection' })
                }
              >
                Back to Team Selection
              </button>
              <button
                className="clear-selection-btn"
                onClick={clearTeamSelection}
              >
                Start New Comparison
              </button>
            </div>
          </section>
        )}

        {teamA && teamB && appMode === 'selection' && (
          <section className="section squads-section">
            <h2>View Full Squads</h2>
            <div className="squads-grid">
              <SquadSection
                groupedPlayers={teamAGrouped}
                filteredPlayers={filteredTeamAPlayers}
                selectedPlayers={selectedPlayersA}
                onToggle={togglePlayerSelection}
                isTeamA={true}
                search={playerSearchA}
                setSearch={(val) =>
                  dispatch({ type: 'SET_PLAYER_SEARCH_A', payload: val })
                }
                positionFilter={positionFilterA}
                setPositionFilter={(val) =>
                  dispatch({ type: 'SET_POSITION_FILTER_A', payload: val })
                }
                selectAll={selectAllPlayers}
                deselectAll={deselectAllPlayers}
                teamName={teamA.name}
                totalPlayers={teamAPlayers.length}
              />

              <SquadSection
                groupedPlayers={teamBGrouped}
                filteredPlayers={filteredTeamBPlayers}
                selectedPlayers={selectedPlayersB}
                onToggle={togglePlayerSelection}
                isTeamA={false}
                search={playerSearchB}
                setSearch={(val) =>
                  dispatch({ type: 'SET_PLAYER_SEARCH_B', payload: val })
                }
                positionFilter={positionFilterB}
                setPositionFilter={(val) =>
                  dispatch({ type: 'SET_POSITION_FILTER_B', payload: val })
                }
                selectAll={selectAllPlayers}
                deselectAll={deselectAllPlayers}
                teamName={teamB.name}
                totalPlayers={teamBPlayers.length}
              />
            </div>
          </section>
        )}

        {teamA && teamB && (
          <section className="section results-section">
            <h2>4. Overall Results</h2>
            <p className="selection-note">
              Results are based on your manual player selections. This reflects
              your choices, not an objective statistical judgment of player
              quality.
            </p>
            <div className="scoreboard">
              <div className="team-score team-a-score">
                <TeamCrest team={teamA} size={80} />
                <h3>{teamA?.name || 'Team A'}</h3>
                <div className="score-value">{teamASelected}</div>
                <p>selected players</p>
              </div>
              <div className="score-divider">
                <div className="verdict">
                  {teamASelected > teamBSelected
                    ? '🏆 Team A has more selected players!'
                    : teamBSelected > teamASelected
                      ? '🏆 Team B has more selected players!'
                      : '🤝 Equal number of selected players!'}
                </div>
              </div>
              <div className="team-score team-b-score">
                <TeamCrest team={teamB} size={80} />
                <h3>{teamB?.name || 'Team B'}</h3>
                <div className="score-value">{teamBSelected}</div>
                <p>selected players</p>
              </div>
            </div>

            <div className="stats-summary">
              <p>Total selected players: {totalSelected}</p>
              <p>
                {teamA.name}: {teamASelected}/{teamAPlayers.length} players
                selected
              </p>
              <p>
                {teamB.name}: {teamBSelected}/{teamBPlayers.length} players
                selected
              </p>
            </div>

            <ScoreChart
              teamA={teamA}
              teamB={teamB}
              teamASelected={teamASelected}
              teamBSelected={teamBSelected}
            />
          </section>
        )}

        <footer className="app-footer">
          <p>
            Player images and data provided by{' '}
            <a
              href="https://www.thesportsdb.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              TheSportsDB
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
