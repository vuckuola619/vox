import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface LowerThirdProps {
  text?: string;
  category?: string;
}

export const LowerThird: React.FC<LowerThirdProps> = ({
  text,
  category = "CASE FILE · ANALYSIS"
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!text) return null;

  // Exit completely after 2 seconds (60 frames)
  if (frame > 60) return null;

  // Smooth slide-in (0-14f), hold (14-46f), smooth slide-out to left (46-60f)
  let translateX = 0;
  let opacity = 1;

  if (frame < 14) {
    translateX = interpolate(frame, [0, 14], [-600, 0], { extrapolateRight: 'clamp' });
    opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  } else if (frame > 46) {
    translateX = interpolate(frame, [46, 60], [0, -700], { extrapolateRight: 'clamp' });
    opacity = interpolate(frame, [46, 58], [1, 0], { extrapolateRight: 'clamp' });
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '70px',
        left: '70px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        transform: `translateX(${translateX}px) rotate(-0.5deg)`,
        opacity,
        zIndex: 28
      }}
    >
      {/* Red Category Tag Strip */}
      <div
        style={{
          backgroundColor: '#B92220',
          color: '#EAE1C8',
          fontFamily: 'Oswald, sans-serif',
          fontWeight: 700,
          fontSize: '14px',
          letterSpacing: '2.5px',
          padding: '4px 16px',
          textTransform: 'uppercase',
          border: '2px solid #221D14',
          boxShadow: '3px 3px 0px #221D14'
        }}
      >
        {category}
      </div>

      {/* Typewriter Caption Paper Strip */}
      <div
        style={{
          backgroundColor: '#EAE1C8',
          color: '#221D14',
          fontFamily: 'Special Elite, Courier New, monospace',
          fontWeight: 700,
          fontSize: '22px',
          lineHeight: '1.3',
          padding: '10px 24px',
          border: '2px solid #221D14',
          boxShadow: '5px 7px 0px #B92220',
          marginTop: '4px',
          maxWidth: '850px',
          clipPath: 'polygon(0% 2%, 98% 0%, 100% 95%, 2% 100%)'
        }}
      >
        <span style={{ color: '#B92220', marginRight: '8px' }}>[REF]:</span>
        {text}
      </div>
    </div>
  );
};
