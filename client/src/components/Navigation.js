import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import './Navigation.css';

const Navigation = () => {
  const { state, dispatch } = useAppContext();
  const { appMode, teamA, teamB, teamALineup, teamBLineup } = state;

  const navItems = [
    {
      id: 'selection',
      label: 'Team Selection',
      icon: '⚽',
      description: 'Select competition and teams',
      enabled: true,
    },
    {
      id: 'building-team-a',
      label: 'Build Team A',
      icon: '🔵',
      description: 'Create lineup for Team A',
      enabled: !!teamA,
    },
    {
      id: 'building-team-b',
      label: 'Build Team B',
      icon: '🔴',
      description: 'Create lineup for Team B',
      enabled: !!teamB,
    },
    {
      id: 'comparing',
      label: 'Compare Lineups',
      icon: '📊',
      description: 'Compare both teams',
      enabled: !!teamALineup && !!teamBLineup,
    },
    {
      id: 'building-best-xi',
      label: 'Best XI',
      icon: '🏆',
      description: 'Build combined best team',
      enabled: !!teamA && !!teamB,
    },
  ];

  const handleNavClick = (itemId) => {
    const item = navItems.find((i) => i.id === itemId);
    if (item && item.enabled) {
      dispatch({ type: 'SET_APP_MODE', payload: itemId });
    }
  };

  return (
    <nav className="navigation">
      <div className="navigation-container">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${appMode === item.id ? 'active' : ''} ${!item.enabled ? 'disabled' : ''}`}
            onClick={() => handleNavClick(item.id)}
            disabled={!item.enabled}
            title={item.description}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;