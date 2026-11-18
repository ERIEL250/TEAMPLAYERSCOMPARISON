import React, { useState } from 'react';
import { getPlayerImageUrl } from '../utils/imageProvider';

const PlayerAvatar = ({ player, size = 64, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imageUrl = getPlayerImageUrl(player);
  const displayName =
    `${player.firstName || ''} ${player.lastName || ''}`.trim() || player.name;

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div
      className={`player-avatar ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e2e8f0',
        flexShrink: 0,
      }}
    >
      {/* Loading placeholder */}
      {isLoading && (
        <div
          className="loading-placeholder"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)',
            animation: 'pulse 1.5s infinite',
          }}
        />
      )}

      {/* Player image */}
      {!hasError && (
        <img
          src={imageUrl}
          alt={displayName}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Neutral football player silhouette fallback */}
      {hasError && (
        <img
          src="https://cdn-icons-png.flaticon.com/512/1149/1149166.png"
          alt={displayName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            backgroundColor: '#4a5568',
          }}
        />
      )}
    </div>
  );
};

export default PlayerAvatar;
