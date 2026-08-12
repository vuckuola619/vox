import React from 'react';
import { useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';

interface RubberStampProps {
  text?: string;
}

export const RubberStamp: React.FC<RubberStampProps> = ({ text = "CLASSIFIED" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stampSpring = spring({
    fps,
    frame: frame - 10,
    config: { damping: 9, stiffness: 280 }
  });

  const scale = interpolate(stampSpring, [0, 1], [3.0, 1.0]);
  const opacity = interpolate(stampSpring, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '180px',
        right: '180px',
        transform: `scale(${scale}) rotate(-12deg)`,
        opacity,
        zIndex: 26
      }}
    >
      <div
        style={{
          border: '4px solid #B92220',
          color: '#B92220',
          fontFamily: 'Oswald, Arial, sans-serif',
          fontWeight: 700,
          fontSize: '32px',
          letterSpacing: '4px',
          padding: '8px 24px',
          textTransform: 'uppercase',
          boxShadow: 'inset 0 0 0 3px rgba(185, 34, 32, 0.2)',
          mixBlendMode: 'multiply'
        }}
      >
        {text}
      </div>
    </div>
  );
};
