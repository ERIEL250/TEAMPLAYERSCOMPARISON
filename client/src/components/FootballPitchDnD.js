import React, { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import PlayerImage from './PlayerImage';
import { getFormation } from '../utils/formations';
import './FootballPitch.css';

const DraggablePlayer = ({ id, player, isSubstitute = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { player, isSubstitute },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`draggable-player ${isSubstitute ? 'substitute' : ''}`}
    >
      <PlayerImage player={player} size={isSubstitute ? 36 : 40} manualUploadEnabled={true} />
      <div className="player-details">
        <span className="player-short-name">{player.name.split(' ').pop()}</span>
        {!isSubstitute && (
          <span className="player-position-code">{id.split('-')[1]?.toUpperCase() || ''}</span>
        )}
      </div>
    </div>
  );
};

const DroppableSlot = ({ id, position, player, isSubstituteSlot = false, index }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`pitch-player-slot ${player ? 'filled' : 'empty'} ${isOver ? 'drop-target' : ''} ${isSubstituteSlot ? 'bench-slot' : ''}`}
      style={!isSubstituteSlot ? {
        left: `${position?.x || 50}%`,
        top: `${position?.y || 50}%`,
        transform: 'translate(-50%, -50%)',
      } : {}}
    >
      {player ? (
        <div className={`pitch-player-card ${isSubstituteSlot ? 'bench-player-card' : ''}`}>
          <DraggablePlayer id={id} player={player} isSubstitute={isSubstituteSlot} />
        </div>
      ) : (
        <div className={`empty-slot-indicator ${isSubstituteSlot ? 'empty-bench-slot' : ''}`}>
          <span className="slot-position">{isSubstituteSlot ? 'SUB' : position?.id?.toUpperCase() || ''}</span>
          <span className="empty-text">Empty</span>
        </div>
      )}
    </div>
  );
};

const FootballPitchDnD = ({
  formation,
  startingPlayers,
  substitutes,
  playerImages = {},
  onLineupChange,
  teamId,
}) => {
  const formationData = getFormation(formation);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const playerMap = new Map();
  startingPlayers.forEach((sp) => {
    if (sp.positionId && sp.player) {
      playerMap.set(sp.positionId, sp.player);
    }
  });

  const substituteSlots = Array(5).fill(null);
  substitutes.forEach((sub, index) => {
    if (index < 5) substituteSlots[index] = sub;
  });

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    if (activeId === overId) return;
    
    const isActiveSub = active.data.current?.isSubstitute;
    const isOverSub = overId.startsWith('sub-');
    
    let newStartingPlayers = [...startingPlayers];
    let newSubstitutes = [...substitutes];
    
    if (isActiveSub && !isOverSub) {
      const subIndex = parseInt(activeId.split('-')[1]);
      const movedPlayer = newSubstitutes[subIndex];
      newSubstitutes = newSubstitutes.filter((_, i) => i !== subIndex);
      
      const existingPlayer = newStartingPlayers.find(sp => sp.positionId === overId);
      if (existingPlayer) {
        newSubstitutes.push(existingPlayer.player);
      }
      
      newStartingPlayers = newStartingPlayers.filter(sp => sp.positionId !== overId);
      newStartingPlayers.push({ positionId: overId, player: movedPlayer });
      
    } else if (!isActiveSub && isOverSub) {
      const fromPositionId = activeId;
      const existingPlayer = newStartingPlayers.find(sp => sp.positionId === fromPositionId);
      
      const overSubIndex = parseInt(overId.split('-')[1]);
      const existingSub = newSubstitutes[overSubIndex];
      
      newStartingPlayers = newStartingPlayers.filter(sp => sp.positionId !== fromPositionId);
      if (existingSub) {
        newStartingPlayers.push({ positionId: fromPositionId, player: existingSub });
      }
      
      newSubstitutes = newSubstitutes.filter((_, i) => i !== overSubIndex);
      if (existingPlayer) {
        newSubstitutes.splice(overSubIndex, 0, existingPlayer.player);
      }
      
    } else if (!isActiveSub && !isOverSub) {
      const fromPositionId = activeId;
      const toPositionId = overId;
      
      const fromPlayer = newStartingPlayers.find(sp => sp.positionId === fromPositionId);
      const toPlayer = newStartingPlayers.find(sp => sp.positionId === toPositionId);
      
      newStartingPlayers = newStartingPlayers.filter(sp => sp.positionId !== fromPositionId && sp.positionId !== toPositionId);
      
      if (toPlayer) {
        newStartingPlayers.push({ positionId: fromPositionId, player: toPlayer.player });
      }
      if (fromPlayer) {
        newStartingPlayers.push({ positionId: toPositionId, player: fromPlayer.player });
      }
      
    } else if (isActiveSub && isOverSub) {
      const fromIndex = parseInt(activeId.split('-')[1]);
      const toIndex = parseInt(overId.split('-')[1]);
      
      const newSubs = [...newSubstitutes];
      const [moved] = newSubs.splice(fromIndex, 1);
      newSubs.splice(toIndex, 0, moved);
      newSubstitutes = newSubs;
    }
    
    onLineupChange && onLineupChange({
      teamId,
      startingPlayers: newStartingPlayers,
      substitutes: newSubstitutes,
    });
  }, [startingPlayers, substitutes, onLineupChange, teamId]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="pitch-container">
        <div className="football-pitch">
          <div className="pitch-halfway-line"></div>
          <div className="pitch-center-circle"></div>
          <div className="pitch-center-spot"></div>
          <div className="penalty-area bottom"></div>
          <div className="penalty-area top"></div>
          <div className="six-yard-box bottom"></div>
          <div className="six-yard-box top"></div>
          <div className="goal bottom"></div>
          <div className="goal top"></div>
          <div className="penalty-spot bottom"></div>
          <div className="penalty-spot top"></div>
          
          {formationData.positions.map((position) => {
            const player = playerMap.get(position.id) || null;
            return (
              <DroppableSlot
                key={position.id}
                id={position.id}
                position={position}
                player={player}
              />
            );
          })}
        </div>
        
        <div className="substitute-bench">
          <h4 className="bench-title">Substitutes ({substitutes.length}/5)</h4>
          <div className="bench-slots">
            {substituteSlots.map((sub, index) => (
              <DroppableSlot
                key={`sub-${index}`}
                id={`sub-${index}`}
                isSubstituteSlot={true}
                index={index}
                player={sub}
              />
            ))}
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default FootballPitchDnD;