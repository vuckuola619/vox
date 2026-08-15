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

  // Smooth Cinematic Motion (Zero Jitter / Zero Shake)

  // 1. KINETIC PUNCH-ZOOM (SNAPPY SMOOTH PUNCH)
  if (transitionStyle === 'kinetic' || transitionStyle === 'kinetic_punch') {
    const punchScale = interpolate(frame, [0, 8, 12, durationInFrames], [1.0, 1.18, 1.15, 1.16], { extrapolateRight: 'clamp' });

    return (
      <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#111111' }}>
        {resolvedSrc ? (
          <Img
            src={resolvedSrc}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${punchScale})`
            }}
          />
        ) : null}
      </div>
    );
  }

  // 2. DEEP 3D DIORAMA (SMOOTH PERSPECTIVE 3D ORBIT CAMERA MOVE)
  if (transitionStyle === 'deep_diorama' || transitionStyle === 'map_pin') {
    const rotateY = interpolate(frame, [0, durationInFrames], [-4, 4], { extrapolateRight: 'clamp' });
    const rotateX = interpolate(frame, [0, durationInFrames], [2, -2], { extrapolateRight: 'clamp' });
    const scale = interpolate(frame, [0, durationInFrames], [1.03, 1.10], { extrapolateRight: 'clamp' });

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

  // 3. CLASSIC SMOOTH KEN BURNS IN / OUT & DYNAMIC SLOW DRIFT
  const isZoomOut = transitionStyle === 'ken_burns_out' || transitionStyle === 'zoom_out';
  const isPanRight = transitionStyle === 'pan_right';
  const isPanLeft = transitionStyle === 'pan_left';

  let startScale = 1.02;
  let endScale = 1.12;
  let startX = -10;
  let endX = 20;
  let startY = 0;
  let endY = -12;

  if (isZoomOut) {
    startScale = 1.12;
    endScale = 1.02;
    startX = 15;
    endX = -15;
  } else if (isPanRight) {
    startScale = 1.06;
    endScale = 1.08;
    startX = -30;
    endX = 30;
  } else if (isPanLeft) {
    startScale = 1.06;
    endScale = 1.08;
    startX = 30;
    endX = -30;
  }

  const scale = interpolate(frame, [0, durationInFrames], [startScale, endScale], { extrapolateRight: 'clamp' });
  const translateX = interpolate(frame, [0, durationInFrames], [startX, endX], { extrapolateRight: 'clamp' });
  const translateY = interpolate(frame, [0, durationInFrames], [startY, endY], { extrapolateRight: 'clamp' });

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
