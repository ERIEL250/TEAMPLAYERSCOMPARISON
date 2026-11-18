import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import sportsDBService, {
  DEFAULT_PLAYER_IMAGE,
  IMAGE_CONFIG,
} from '../services/sportsDBService';
import './PlayerImage.css';

const PlayerImage = ({
  player,
  size = 64,
  className = '',
  manualUploadEnabled = true,
  onImageLoaded = null,
}) => {
  const { state, dispatch } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(DEFAULT_PLAYER_IMAGE);
  const [showUpload, setShowUpload] = useState(false);
  const [fallbackBroken, setFallbackBroken] = useState(false);
  const fileInputRef = useRef(null);

  const playerId = player?.id;
  const displayName =
    `${player?.firstName || ''} ${player?.lastName || ''}`.trim() ||
    player?.name ||
    'Player';

  useEffect(() => {
    let cancelled = false;

    const loadImage = async () => {
      setIsLoading(true);
      setFallbackBroken(false);
      setShowUpload(false);
      setImageUrl(DEFAULT_PLAYER_IMAGE);

      if (!player || playerId == null) {
        setIsLoading(false);
        setShowUpload(true);
        return;
      }

      try {
        const contextCachedUrl = state.playerImageCache[String(playerId)];
        const localCachedUrl = sportsDBService.getCachedImage(playerId);
        const url =
          contextCachedUrl ||
          localCachedUrl ||
          (await sportsDBService.fetchPlayerImage(player));
        if (cancelled) return;

        const resolvedUrl = url || DEFAULT_PLAYER_IMAGE;
        setImageUrl(resolvedUrl);
        setShowUpload(resolvedUrl === DEFAULT_PLAYER_IMAGE);
        setIsLoading(false);
        if (onImageLoaded) onImageLoaded(playerId, resolvedUrl);
      } catch (error) {
        if (cancelled) return;
        console.warn(`Could not load image for ${displayName}:`, error);
        setImageUrl(DEFAULT_PLAYER_IMAGE);
        setShowUpload(true);
        setIsLoading(false);
      }
    };

    loadImage();
    return () => {
      cancelled = true;
    };
  }, [player, playerId, displayName, onImageLoaded, state.playerImageCache]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || playerId == null) return;

    try {
      const dataUrl = await sportsDBService.processManualUpload(file);
      sportsDBService.addManualUpload(playerId, dataUrl);
      dispatch({
        type: 'UPDATE_PLAYER_IMAGE_CACHE',
        payload: { playerId, url: dataUrl },
      });
      setImageUrl(dataUrl);
      setShowUpload(false);
      setFallbackBroken(false);
      setIsLoading(false);
      if (onImageLoaded) onImageLoaded(playerId, dataUrl);
    } catch (error) {
      console.error('Manual player image upload failed:', error);
      window.alert(error.message || 'Could not upload this image.');
    } finally {
      event.target.value = '';
    }
  };

  const handleImageError = () => {
    setIsLoading(false);
    if (imageUrl !== DEFAULT_PLAYER_IMAGE) {
      setImageUrl(DEFAULT_PLAYER_IMAGE);
      setShowUpload(true);
    } else {
      setFallbackBroken(true);
      setShowUpload(true);
    }
  };

  const canUpload = manualUploadEnabled;

  return (
    <div
      className={`player-image-container ${className} ${canUpload ? 'can-upload' : ''}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        backgroundColor: '#e2e8f0',
      }}
      title={
        canUpload ? `${displayName}: click to upload a photo` : displayName
      }
    >
      {isLoading && (
        <div
          className="loading-placeholder"
          aria-label="Loading player image"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)',
            animation: 'pulse 1.5s infinite',
          }}
        />
      )}

      {!fallbackBroken && (
        <img
          src={imageUrl}
          alt={displayName}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={handleImageError}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.2s ease',
          }}
        />
      )}

      {fallbackBroken && (
        <span
          aria-label={`${displayName} image unavailable`}
          style={{
            color: '#475569',
            fontSize: Math.max(10, size * 0.3),
            fontWeight: 700,
          }}
        >
          {displayName.charAt(0).toUpperCase()}
        </span>
      )}

      {canUpload && (
        <button
          type="button"
          className="upload-overlay"
          onClick={handleUploadClick}
          title={`Upload photo for ${displayName}`}
          aria-label={`Upload photo for ${displayName}`}
          style={{
            position: 'absolute',
            inset: 0,
            border: 0,
            padding: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.62)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            cursor: 'pointer',
            fontSize: 10,
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Upload
        </button>
      )}

      {manualUploadEnabled && (
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_CONFIG.allowedFileTypes.join(',')}
          onChange={handleFileChange}
          aria-label={`Choose image for ${displayName}`}
          style={{ display: 'none' }}
        />
      )}
    </div>
  );
};

export default PlayerImage;
