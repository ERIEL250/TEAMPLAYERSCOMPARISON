import React, { createContext, useContext, useReducer, useEffect } from 'react';
import sportsDBService from '../services/sportsDBService';

const AppContext = createContext();

const initialState = {
  competitions: [],
  selectedCompetition: '',
  teams: [],
  teamA: null,
  teamB: null,
  teamAPlayers: [],
  teamBPlayers: [],
  selectedPlayersA: new Set(),
  selectedPlayersB: new Set(),
  playerSearchA: '',
  playerSearchB: '',
  positionFilterA: 'ALL',
  positionFilterB: 'ALL',
  loading: false,
  error: null,
  searchTeamA: '',
  searchTeamB: '',
  appMode: 'selection',
  teamALineup: null,
  teamBLineup: null,
  bestXILineup: null,
  lineupPresets: [],
  darkMode: localStorage.getItem('darkMode') === 'true',
  playerImagesLoaded: false,
  playerImageCache: {},
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_COMPETITIONS':
      return { ...state, competitions: action.payload };
    case 'SET_SELECTED_COMPETITION':
      return { ...state, selectedCompetition: action.payload };
    case 'SET_TEAMS':
      return { ...state, teams: action.payload };
    case 'SET_TEAM_A':
      return { ...state, teamA: action.payload };
    case 'SET_TEAM_B':
      return { ...state, teamB: action.payload };
    case 'SET_TEAM_A_PLAYERS':
      return { ...state, teamAPlayers: action.payload };
    case 'SET_TEAM_B_PLAYERS':
      return { ...state, teamBPlayers: action.payload };
    case 'SET_SELECTED_PLAYERS_A':
      const newSelectedA =
        typeof action.payload === 'function'
          ? action.payload(state.selectedPlayersA)
          : action.payload;
      return { ...state, selectedPlayersA: newSelectedA };
    case 'SET_SELECTED_PLAYERS_B':
      const newSelectedB =
        typeof action.payload === 'function'
          ? action.payload(state.selectedPlayersB)
          : action.payload;
      return { ...state, selectedPlayersB: newSelectedB };
    case 'SET_PLAYER_SEARCH_A':
      return { ...state, playerSearchA: action.payload };
    case 'SET_PLAYER_SEARCH_B':
      return { ...state, playerSearchB: action.payload };
    case 'SET_POSITION_FILTER_A':
      return { ...state, positionFilterA: action.payload };
    case 'SET_POSITION_FILTER_B':
      return { ...state, positionFilterB: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SEARCH_TEAM_A':
      return { ...state, searchTeamA: action.payload };
    case 'SET_SEARCH_TEAM_B':
      return { ...state, searchTeamB: action.payload };
    case 'SET_APP_MODE':
      return { ...state, appMode: action.payload };
    case 'SET_TEAM_A_LINEUP':
      return { ...state, teamALineup: action.payload };
    case 'SET_TEAM_B_LINEUP':
      return { ...state, teamBLineup: action.payload };
    case 'SET_BEST_XI_LINEUP':
      return { ...state, bestXILineup: action.payload };
    case 'SAVE_LINEUP_PRESET':
      return {
        ...state,
        lineupPresets: [...state.lineupPresets, action.payload],
      };
    case 'DELETE_LINEUP_PRESET':
      return {
        ...state,
        lineupPresets: state.lineupPresets.filter(
          (_, i) => i !== action.payload
        ),
      };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'SET_PLAYER_IMAGES_LOADED':
      return { ...state, playerImagesLoaded: action.payload };
    case 'UPDATE_PLAYER_IMAGE_CACHE':
      return {
        ...state,
        playerImageCache: {
          ...state.playerImageCache,
          [action.payload.playerId]: action.payload.url,
        },
      };
    case 'CLEAR_ALL':
      return {
        ...initialState,
        competitions: state.competitions,
        lineupPresets: state.lineupPresets,
        darkMode: state.darkMode,
        playerImagesLoaded: state.playerImagesLoaded,
        playerImageCache: state.playerImageCache,
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedLineupA = localStorage.getItem('teamALineup');
    const savedLineupB = localStorage.getItem('teamBLineup');
    const savedPresets = localStorage.getItem('lineupPresets');
    if (savedLineupA)
      dispatch({
        type: 'SET_TEAM_A_LINEUP',
        payload: JSON.parse(savedLineupA),
      });
    if (savedLineupB)
      dispatch({
        type: 'SET_TEAM_B_LINEUP',
        payload: JSON.parse(savedLineupB),
      });
    if (savedPresets) {
      const presets = JSON.parse(savedPresets);
      presets.forEach((preset) => {
        dispatch({ type: 'SAVE_LINEUP_PRESET', payload: preset });
      });
    }
  }, []);

  useEffect(() => {
    if (state.teamALineup) {
      localStorage.setItem('teamALineup', JSON.stringify(state.teamALineup));
    } else {
      localStorage.removeItem('teamALineup');
    }
  }, [state.teamALineup]);

  useEffect(() => {
    if (state.teamBLineup) {
      localStorage.setItem('teamBLineup', JSON.stringify(state.teamBLineup));
    } else {
      localStorage.removeItem('teamBLineup');
    }
  }, [state.teamBLineup]);

  useEffect(() => {
    localStorage.setItem('lineupPresets', JSON.stringify(state.lineupPresets));
  }, [state.lineupPresets]);

  useEffect(() => {
    localStorage.setItem('darkMode', state.darkMode.toString());
  }, [state.darkMode]);

  useEffect(() => {
    const allPlayers = [...state.teamAPlayers, ...state.teamBPlayers];
    if (allPlayers.length === 0) return;

    const preloadImages = async () => {
      dispatch({ type: 'SET_PLAYER_IMAGES_LOADED', payload: false });

      await sportsDBService.bulkFetchAllPlayerImages(
        allPlayers,
        (playerId, url) => {
          dispatch({
            type: 'UPDATE_PLAYER_IMAGE_CACHE',
            payload: { playerId, url },
          });
        }
      );

      dispatch({ type: 'SET_PLAYER_IMAGES_LOADED', payload: true });
    };

    preloadImages();
  }, [state.teamAPlayers, state.teamBPlayers]);

  useEffect(() => {
    const allCachedPlayers = Object.keys(state.playerImageCache);
    if (allCachedPlayers.length > 0) {
      allCachedPlayers.forEach((playerId) => {
        const url = state.playerImageCache[playerId];
        if (
          url &&
          url !== 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
        ) {
          const img = new Image();
          img.src = url;
        }
      });
    }
  }, [state.playerImageCache]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
