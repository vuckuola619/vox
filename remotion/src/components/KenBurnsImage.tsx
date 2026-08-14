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

  // 1. KINETIC PUNCH-ZOOM (SNAPPY 20% PUNCH WITH HARD STOP)
  if (transitionStyle === 'kinetic' || transitionStyle === 'kinetic_punch') {
    const punchScale = interpolate(frame, [0, 8, 12, durationInFrames], [1.0, 1.22, 1.18, 1.20], { extrapolateRight: 'clamp' });
    const shakeX = frame >= 8 && frame <= 14 ? Math.sin(frame * 3.5) * 5 : 0;

    return (
      <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#111111' }}>
        {resolvedSrc ? (
          <Img
            src={resolvedSrc}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${punchScale}) translate(${shakeX}px, 0px)`
            }}
          />
        ) : null}
      </div>
    );
  }

  // 2. DEEP 3D DIORAMA (PERSPECTIVE 3D ORBIT CAMERA MOVE)
  if (transitionStyle === 'deep_diorama' || transitionStyle === 'map_pin') {
    const rotateY = interpolate(frame, [0, durationInFrames], [-6, 6], { extrapolateRight: 'clamp' });
    const rotateX = interpolate(frame, [0, durationInFrames], [4, -3], { extrapolateRight: 'clamp' });
    const scale = interpolate(frame, [0, durationInFrames], [1.05, 1.15], { extrapolateRight: 'clamp' });

    return (
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#111111',
          perspective: '1200px'
        }}
      >
        {resolvedSrc ? (
          <Img
            src={resolvedSrc}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `perspective(1200px) scale(${scale}) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
              transformOrigin: 'center center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
            }}
          />
        ) : null}
      </div>
    );
  }

  // 3. CLASSIC KEN BURNS IN / OUT
  const isZoomOut = transitionStyle === 'ken_burns_out';
  const scale = interpolate(frame, [0, durationInFrames], isZoomOut ? [1.14, 1.02] : [1.02, 1.14], { extrapolateRight: 'clamp' });
  const translateX = interpolate(frame, [0, durationInFrames], isZoomOut ? [-20, 20] : [0, -25], { extrapolateRight: 'clamp' });
  const translateY = interpolate(frame, [0, durationInFrames], [0, -12], { extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#111111' }}>
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
      ) : null}
    </div>
  );
};
