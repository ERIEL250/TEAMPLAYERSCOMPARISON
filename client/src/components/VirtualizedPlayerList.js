import React from 'react';
import { FixedSizeGrid } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import PlayerCard from './PlayerCard';

const CARD_WIDTH = 180;
const CARD_HEIGHT = 140;

const VirtualizedPlayerList = ({
  players,
  selectedPlayers,
  onToggle,
  isTeamA,
}) => {
  const columnCount = Math.floor(window.innerWidth / CARD_WIDTH) || 3;

  const renderCell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columnCount + columnIndex;
    if (index >= players.length) return null;

    const player = players[index];
    return (
      <div style={style}>
        <PlayerCard
          player={player}
          isSelected={selectedPlayers.has(player.id)}
          onToggle={onToggle}
          isTeamA={isTeamA}
        />
      </div>
    );
  };

  return (
    <div
      className="virtualized-list-container"
      style={{ height: Math.min(players.length * CARD_HEIGHT, 600) }}
    >
      <AutoSizer>
        {({ height, width }) => {
          const rowCount = Math.ceil(players.length / columnCount);
          return (
            <FixedSizeGrid
              columnCount={columnCount}
              columnWidth={CARD_WIDTH}
              height={height}
              rowCount={rowCount}
              rowHeight={CARD_HEIGHT}
              width={width}
            >
              {renderCell}
            </FixedSizeGrid>
          );
        }}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedPlayerList;
