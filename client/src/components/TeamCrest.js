import React, { useState } from 'react';
import { getTeamCrestUrl } from '../utils/imageProvider';

const TeamCrest = ({ team, size = 80, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imageUrl = getTeamCrestUrl(team);
  const initials = team.name?.substring(0, 3).toUpperCase() || 'N/A';

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Generate fallback URL for error state
  const fallbackUrl = `https://ui-avatars.com/api/?background=1e40af&color=fff&size=${size}&bold=true&name=${encodeURIComponent(initials)}`;

  return (
    <div
      className={`team-crest ${className}`}
      style={{
        width: size,
        height: size,
        overflow: 'hidden',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
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

      {/* Team crest image */}
      {!hasError && (
        <img
          src={imageUrl}
          alt={team.name}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '4px',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        />
      )}

      {/* Fallback initials */}
      {hasError && (
        <img
          src={fallbackUrl}
          alt={team.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      )}
    </div>
  );
};

export default TeamCrest;
