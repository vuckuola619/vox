import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate, Img, staticFile } from 'remotion';

interface PaperCutoutCardProps {
  imagePath?: string;
  caption?: string;
  width?: number;
  height?: number;
  rotation?: number;
}

export const PaperCutoutCard: React.FC<PaperCutoutCardProps> = ({
  imagePath,
  caption,
  width = 640,
  height = 420,
  rotation = -3
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring pop-up with overshoot ("cutting on twos")
  const rawPop = spring({
    fps,
    frame: frame - 4,
    config: { damping: 12, stiffness: 200 }
  });
  const steppedPop = Math.floor(rawPop * 10) / 10;

  const scale = interpolate(steppedPop, [0, 1], [0.7, 1.0]);
  const opacity = interpolate(steppedPop, [0, 1], [0, 1]);

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

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
        zIndex: 18
      }}
    >
      {/* Offset Red Stroke Background Shadow */}
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '12px',
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: '#B92220',
          border: '3px solid #221D14',
          clipPath: 'polygon(0% 1%, 98% 0%, 100% 97%, 2% 100%)'
        }}
      />

      {/* Main Archival Photo Card */}
      <div
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: '#EAE1C8',
          border: '4px solid #221D14',
          boxShadow: '0 12px 28px rgba(34, 29, 20, 0.45)',
          padding: '12px',
          clipPath: 'polygon(0% 1%, 99% 0%, 100% 98%, 1% 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Masking Tape Corner Accent */}
        <div
          style={{
            position: 'absolute',
            top: '-18px',
            left: '30px',
            width: '130px',
            height: '36px',
            backgroundColor: 'rgba(215, 199, 156, 0.85)',
            border: '1px solid rgba(114, 108, 94, 0.5)',
            transform: 'rotate(-12deg)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.25)',
            clipPath: 'polygon(4% 0%, 96% 0%, 100% 50%, 96% 100%, 4% 100%, 0% 50%)',
            zIndex: 5
          }}
        />

        {/* Photo Image Frame */}
        <div
          style={{
            width: '100%',
            height: caption ? `${height - 70}px` : '100%',
            overflow: 'hidden',
            border: '2px solid #221D14',
            backgroundColor: '#1A1A1A'
          }}
        >
          {resolvedSrc ? (
            <Img
              src={resolvedSrc}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'contrast(1.08) saturate(0.9)'
              }}
            />
          ) : null}
        </div>

        {/* Typewriter Annotation Strip */}
        {caption ? (
          <div
            style={{
              marginTop: '8px',
              fontFamily: 'Special Elite, Courier New, monospace',
              fontSize: '16px',
              color: '#221D14',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}
          >
            {caption}
          </div>
        ) : null}
      </div>
    </div>
  );
};
