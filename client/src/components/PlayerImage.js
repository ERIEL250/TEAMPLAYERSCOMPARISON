import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import sportsDBService, { DEFAULT_PLAYER_IMAGE } from '../services/sportsDBService';
import './PlayerImage.css';

const PlayerImage = ({
  player,
  size = 'medium',
  onImageLoaded,
  className = '',
  showUploadButton = true,
  manualUploadEnabled,
  fallbackUrl,
  style = {},
}) => {
  const [imageUrl, setImageUrl] = useState(fallbackUrl || DEFAULT_PLAYER_IMAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const playerId = player?.id;

  const actualShowUpload = showUploadButton || manualUploadEnabled;

  const getSizeClass = () => {
    if (typeof size === 'number') {
      if (size <= 40) return 'small';
      if (size <= 60) return 'medium';
      if (size <= 100) return 'large';
      return 'x-large';
    }
    return size;
  };

  const loadImage = useCallback(() => {
    if (!player || player.id == null) {
      setIsLoading(false);
      setImageUrl(fallbackUrl || DEFAULT_PLAYER_IMAGE);
      return;
    }

    setIsLoading(true);
    setError(null);

    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);

    loadTimeoutRef.current = setTimeout(async () => {
      try {
        const url = await sportsDBService.fetchPlayerImage(player);
        setImageUrl(url);
        if (onImageLoaded) onImageLoaded(player.id, url);
      } catch (err) {
        console.warn('Failed to load player image:', err);
        setError(err.message || 'Failed to load image');
        setImageUrl(fallbackUrl || DEFAULT_PLAYER_IMAGE);
      } finally {
        setIsLoading(false);
      }
    }, 50);
  }, [player, fallbackUrl, onImageLoaded]);

  useEffect(() => {
    loadImage();
    return () => {
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, [loadImage]);

  const handleImageError = useCallback(() => {
    setImageUrl(DEFAULT_PLAYER_IMAGE);
    setError('Failed to load image');
  }, []);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      await sportsDBService.processManualUpload(file);
      const uploadedUrl = await sportsDBService.addManualUpload(playerId, file);
      setImageUrl(uploadedUrl);
      if (onImageLoaded) onImageLoaded(playerId, uploadedUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const sizeClass = getSizeClass();

  return (
    <div className={`player-image-container ${className} ${actualShowUpload && playerId != null ? 'can-upload' : ''}`} style={style}>
      <div className={`player-image-wrapper ${sizeClass}`} style={typeof size === 'number' ? { width: size, height: size } : undefined}>
        {isLoading ? (
          <div className="player-image-loading">
            <div className="player-image-spinner" />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={player?.name || 'Player'}
            className={`player-image ${sizeClass}`}
            onError={handleImageError}
            loading="lazy"
            style={typeof size === 'number' ? { width: size, height: size } : undefined}
          />
        )}
        {actualShowUpload && playerId != null && (
          <button
            className="upload-overlay"
            onClick={handleUploadClick}
            aria-label="Upload player image"
            title="Upload custom player image"
            disabled={isUploading}
          >
            {isUploading ? '...' : '📷'}
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={isUploading}
          className="player-image-file-input"
          style={{ display: 'none' }}
        />
      </div>
      {error && <p className="player-image-error">{error}</p>}
    </div>
  );
};

PlayerImage.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
  }),
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['small', 'medium', 'large', 'x-large']),
    PropTypes.number,
  ]),
  onImageLoaded: PropTypes.func,
  className: PropTypes.string,
  showUploadButton: PropTypes.bool,
  manualUploadEnabled: PropTypes.bool,
  fallbackUrl: PropTypes.string,
  style: PropTypes.object,
};

export default PlayerImage;