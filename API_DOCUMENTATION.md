# API Documentation

## Overview
Football Lineup Builder uses TheSportsDB API as its data source. All API requests are proxied through the application to avoid CORS issues.

## Base URL
```
https://www.thesportsdb.com/api/v1/json/{API_KEY}/
```

## Endpoints

### Get All Competitions
```http
GET /all_leagues.php
```
Returns a list of all available football competitions.

**Response Example:**
```json
{
  "leagues": [
    {
      "idLeague": "4328",
      "strLeague": "English Premier League",
      "strSport": "Soccer",
      "strLeagueAlternate": "Premier League"
    }
  ]
}
```

### Get Teams by League
```http
GET /lookup_all_teams.php?id={leagueId}
```
Returns all teams for a specific competition.

**Parameters:**
- `leagueId` (string, required) - The ID of the competition

**Response Example:**
```json
{
  "teams": [
    {
      "idTeam": "133604",
      "strTeam": "Arsenal",
      "strTeamBadge": "https://www.thesportsdb.com/images/media/team/badge/...png"
    }
  ]
}
```

### Get Team Details
```http
GET /lookupteam.php?id={teamId}
```
Returns detailed information about a specific team.

**Parameters:**
- `teamId` (string, required) - The ID of the team

### Get Events by League
```http
GET /eventsnextleague.php?id={leagueId}
```
Returns upcoming events for a specific league.

---

## Internal Utility APIs

### shareUtils.js
Utility functions for lineup sharing:

#### `generateShareURL(lineup)`
Generates a shareable URL from a lineup object.
```javascript
const url = generateShareURL({
  homeTeam: { id: '123', name: 'Arsenal' },
  awayTeam: { id: '456', name: 'Chelsea' },
  formation: '4-3-3',
  players: [...]
});
```

#### `loadFromShareURL()`
Loads lineup state from the current URL parameters.

#### `copyToClipboard(text)`
Copies text to the user's clipboard.

---

### monitoring.js
Monitoring and error tracking utilities:

#### `initMonitoring()`
Initializes Sentry error tracking in production.

#### `trackEvent(eventName, properties)`
Tracks user analytics events.

#### `trackPerformance(metricName, value)`
Tracks performance metrics.

---

## State Management

### AppContext State Structure
```javascript
{
  competitions: [],
  homeTeam: null,
  awayTeam: null,
  selectedPlayers: {},
  formation: '4-3-3',
  lineupPresets: [],
  darkMode: false,
  loading: false,
  error: null
}
```

### Reducer Actions
- `SET_COMPETITIONS` - Update available competitions
- `SELECT_HOME_TEAM` - Set home team
- `SELECT_AWAY_TEAM` - Set away team
- `SELECT_PLAYER` - Add player to lineup
- `REMOVE_PLAYER` - Remove player from lineup
- `SET_FORMATION` - Change formation
- `SAVE_LINEUP_PRESET` - Save lineup preset
- `DELETE_LINEUP_PRESET` - Delete lineup preset
- `TOGGLE_DARK_MODE` - Toggle dark/light mode