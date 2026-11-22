import React, { useState, useCallback } from 'react';
import FootballPitchDnD from './FootballPitchDnD';
import TeamCrest from './TeamCrest';
import './LineupComparison.css';

const LineupComparison = ({ teamALineup: initialTeamALineup, teamBLineup: initialTeamBLineup, teamA, teamB }) => {
  const [teamALineup, setTeamALineup] = useState(initialTeamALineup);
  const [teamBLineup, setTeamBLineup] = useState(initialTeamBLineup);

  const getPositionDistribution = (lineup) => {
    if (!lineup) return { GK: 0, DEF: 0, MID: 0, FWD: 0 };

    const dist = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    lineup.startingPlayers.forEach(({ player }) => {
      if (!player?.position) return;
      const pos = player.position.toLowerCase();
      if (pos.includes('goalkeeper') || pos.includes('gk')) dist.GK++;
      else if (
        pos.includes('back') ||
        pos.includes('defender') ||
        pos.includes('cb') ||
        pos.includes('lb') ||
        pos.includes('rb')
      )
        dist.DEF++;
      else if (
        pos.includes('midfield') ||
        pos.includes('cm') ||
        pos.includes('cam') ||
        pos.includes('cdm')
      )
        dist.MID++;
      else if (
        pos.includes('forward') ||
        pos.includes('striker') ||
        pos.includes('wing') ||
        pos.includes('st')
      )
        dist.FWD++;
    });

    return dist;
  };

  const teamADist = getPositionDistribution(teamALineup);
  const teamBDist = getPositionDistribution(teamBLineup);

  const formatStartingPlayers = (lineup) => {
    if (!lineup) return [];
    return lineup.startingPlayers.filter((sp) => sp.positionId && sp.player);
  };

  const teamAStarting = formatStartingPlayers(teamALineup);
  const teamBStarting = formatStartingPlayers(teamBLineup);

  const handleLineupChange = useCallback(({ teamId, startingPlayers, substitutes }) => {
    if (teamId === 'teamA') {
      setTeamALineup(prev => ({
        ...prev,
        startingPlayers,
        substitutePlayers: substitutes,
      }));
    } else if (teamId === 'teamB') {
      setTeamBLineup(prev => ({
        ...prev,
        startingPlayers,
        substitutePlayers: substitutes,
      }));
    }
  }, []);

  return (
    <div className="lineup-comparison-container">
      <h2 className="comparison-title">Team Lineup Comparison</h2>

      <div className="comparison-pitches">
        <div className="team-pitch-wrapper">
          <div className="team-header">
            <TeamCrest team={teamA} size={48} />
            <div className="team-header-info">
              <h3>{teamA?.name || 'Team A'}</h3>
              <p>Formation: {teamALineup?.formation || '4-3-3'}</p>
            </div>
          </div>

          <div className="position-stats">
            <div className="stat">GK: {teamADist.GK}</div>
            <div className="stat">DEF: {teamADist.DEF}</div>
            <div className="stat">MID: {teamADist.MID}</div>
            <div className="stat">FWD: {teamADist.FWD}</div>
          </div>

          <FootballPitchDnD
            formation={teamALineup?.formation || '4-3-3'}
            startingPlayers={teamAStarting}
            substitutes={teamALineup?.substitutePlayers || []}
            teamId="teamA"
            onLineupChange={handleLineupChange}
          />
        </div>

        <div className="team-pitch-wrapper">
          <div className="team-header">
            <TeamCrest team={teamB} size={48} />
            <div className="team-header-info">
              <h3>{teamB?.name || 'Team B'}</h3>
              <p>Formation: {teamBLineup?.formation || '4-3-3'}</p>
            </div>
          </div>

          <div className="position-stats">
            <div className="stat">GK: {teamBDist.GK}</div>
            <div className="stat">DEF: {teamBDist.DEF}</div>
            <div className="stat">MID: {teamBDist.MID}</div>
            <div className="stat">FWD: {teamBDist.FWD}</div>
          </div>

          <FootballPitchDnD
            formation={teamBLineup?.formation || '4-3-3'}
            startingPlayers={teamBStarting}
            substitutes={teamBLineup?.substitutePlayers || []}
            teamId="teamB"
            onLineupChange={handleLineupChange}
          />
        </div>
      </div>

      <div className="comparison-summary">
        <h3>Squad Summary</h3>
        <div className="summary-grid">
          <div className="summary-card team-a">
            <h4>{teamA?.name || 'Team A'}</h4>
            <ul>
              <li>Starting XI: {teamAStarting.length}/11</li>
              <li>
                Substitutes: {teamALineup?.substitutePlayers?.length || 0}/5
              </li>
              <li>Formation: {teamALineup?.formation || '4-3-3'}</li>
            </ul>
          </div>
          <div className="summary-card team-b">
            <h4>{teamB?.name || 'Team B'}</h4>
            <ul>
              <li>Starting XI: {teamBStarting.length}/11</li>
              <li>
                Substitutes: {teamBLineup?.substitutePlayers?.length || 0}/5
              </li>
              <li>Formation: {teamBLineup?.formation || '4-3-3'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineupComparison;