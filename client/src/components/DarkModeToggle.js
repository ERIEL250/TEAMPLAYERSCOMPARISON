import React from 'react';
import { useAppContext } from '../contexts/AppContext';

function DarkModeToggle() {
  const { state, dispatch } = useAppContext();
  const { darkMode } = state;

  return (
    <button
      className="dark-mode-toggle"
      onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  );
}

export default DarkModeToggle;
