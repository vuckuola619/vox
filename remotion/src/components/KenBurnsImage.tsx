import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile } from 'remotion';

interface KenBurnsImageProps {
  imagePath?: string;
  durationInFrames: number;
  transitionStyle?: string;
}

export const KenBurnsImage: React.FC<KenBurnsImageProps> = ({
  imagePath,
  durationInFrames,
  transitionStyle = 'ken_burns_in'
}) => {
  const frame = useCurrentFrame();

  const getResolvedSrc = (src?: string) => {
    if (!src) return undefined;
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
      return src;
    }
    const cleanPath = src.replace(/\\/g, '/');
    const relativePart = cleanPath.includes('/public/')
      ? cleanPath.split('/public/')[1]
      : cleanPath.startsWith('/')
      ? cleanPath.slice(1)
      : cleanPath;
    try {
      return staticFile(relativePart);
    } catch {
      return src;
    }
  };

  const resolvedSrc = getResolvedSrc(imagePath);
  const isZoomOut = transitionStyle === 'ken_burns_out';

  const scale = interpolate(
    frame,
    [0, durationInFrames],
    isZoomOut ? [1.15, 1.0] : [1.0, 1.15],
    { extrapolateRight: 'clamp' }
  );

  const translateX = interpolate(
    frame,
    [0, durationInFrames],
    isZoomOut ? [-20, 20] : [0, -30],
    { extrapolateRight: 'clamp' }
  );

  const translateY = interpolate(
    frame,
    [0, durationInFrames],
    [0, -15],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#111111'
      }}
    >
      {resolvedSrc ? (
        <Img
          src={resolvedSrc}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`
          }}
        />
      ) : (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #111111 0%, #1d2d44 50%, #0d1b2a 100%)',
            transform: `scale(${scale})`
          }}
        >
          <div
            style={{
              width: '80%',
              height: '80%',
              border: '2px dashed rgba(255, 221, 0, 0.4)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <h2 style={{ color: '#F3EFE0', fontFamily: 'Arial, sans-serif', opacity: 0.6 }}>
              VOX EDITORIAL GRAPHIC
            </h2>
          </div>
        </div>
      )}
    </div>
  );
};
