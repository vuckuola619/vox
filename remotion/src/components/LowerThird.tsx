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

  // Stop-motion slide-in with stepped easing ("cutting on twos")
  const rawSlide = spring({
    fps,
    frame: frame - 5,
    config: { damping: 14, stiffness: 180 }
  });
  const steppedSlide = Math.floor(rawSlide * 10) / 10;

  const translateX = interpolate(steppedSlide, [0, 1], [-600, 0]);
  const opacity = interpolate(steppedSlide, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '70px',
        left: '70px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        transform: `translateX(${translateX}px) rotate(-1deg)`,
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
