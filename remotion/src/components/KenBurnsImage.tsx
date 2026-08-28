import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, OffthreadVideo, Loop, staticFile } from 'remotion';

interface KenBurnsImageProps {
  imagePath?: string;
  videoPath?: string;
  durationInFrames: number;
  transitionStyle?: string;
}

export const KenBurnsImage: React.FC<KenBurnsImageProps> = ({
  imagePath,
  videoPath,
  durationInFrames,
  transitionStyle = 'ken_burns_in'
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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

  const rawSrc = videoPath || imagePath;
  const resolvedSrc = getResolvedSrc(rawSrc);
  const isVideo = resolvedSrc ? (resolvedSrc.endsWith('.mp4') || resolvedSrc.endsWith('.webm')) : false;

  const renderMedia = (style: React.CSSProperties) => {
    if (!resolvedSrc) return null;
    if (isVideo) {
      return (
        <Loop durationInFrames={150}>
          <OffthreadVideo
            src={resolvedSrc}
            style={style}
            muted
            pauseWhenBuffering
          />
        </Loop>
      );
    }
    return (
      <Img
        src={resolvedSrc}
        style={style}
      />
    );
  };

  // 1. KINETIC PUNCH-ZOOM (SNAPPY SMOOTH PUNCH)
  if (transitionStyle === 'kinetic' || transitionStyle === 'kinetic_punch') {
    const punchScale = interpolate(frame, [0, 8, 12, durationInFrames], [1.0, 1.18, 1.15, 1.18], { extrapolateRight: 'clamp' });

    return (
      <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#111111' }}>
        {renderMedia({
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${punchScale})`
        })}
      </div>
    );
  }

  // 2. DEEP 3D DIORAMA (SMOOTH PERSPECTIVE 3D ORBIT CAMERA MOVE)
  if (transitionStyle === 'deep_diorama' || transitionStyle === 'map_pin') {
    const rotateY = interpolate(frame, [0, durationInFrames], [-4, 4], { extrapolateRight: 'clamp' });
    const rotateX = interpolate(frame, [0, durationInFrames], [2, -2], { extrapolateRight: 'clamp' });
    const scale = interpolate(frame, [0, durationInFrames], [1.03, 1.12], { extrapolateRight: 'clamp' });

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
        {renderMedia({
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `perspective(1200px) scale(${scale}) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
          transformOrigin: 'center center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
        })}
      </div>
    );
  }

  // 3. CLASSIC DYNAMIC VOX KEN BURNS & SCAN MOVES
  const isZoomOut = transitionStyle === 'ken_burns_out' || transitionStyle === 'zoom_out';
  const isPanRight = transitionStyle === 'pan_right' || transitionStyle === 'ken_burns_pan_right';
  const isPanLeft = transitionStyle === 'pan_left' || transitionStyle === 'ken_burns_pan_left';

  let startScale = 1.04;
  let endScale = 1.15;
  let startX = -20;
  let endX = 30;
  let startY = 0;
  let endY = -15;

  if (isZoomOut) {
    startScale = 1.15;
    endScale = 1.03;
    startX = 25;
    endX = -20;
    startY = -10;
    endY = 5;
  } else if (isPanRight) {
    startScale = 1.08;
    endScale = 1.12;
    startX = -60;
    endX = 50;
    startY = -5;
    endY = 5;
  } else if (isPanLeft) {
    startScale = 1.08;
    endScale = 1.12;
    startX = 50;
    endX = -60;
    startY = 5;
    endY = -5;
  }

  const scale = interpolate(frame, [0, durationInFrames], [startScale, endScale], { extrapolateRight: 'clamp' });
  const translateX = interpolate(frame, [0, durationInFrames], [startX, endX], { extrapolateRight: 'clamp' });
  const translateY = interpolate(frame, [0, durationInFrames], [startY, endY], { extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#111111' }}>
      {renderMedia({
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`
      })}
    </div>
  );
};
