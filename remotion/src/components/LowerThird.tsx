import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface LowerThirdProps {
  text?: string;
  category?: string;
}

export const LowerThird: React.FC<LowerThirdProps> = ({
  text,
  category = "VOX EXPLAINER"
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!text) return null;

  // Slide in from left animation
  const slideIn = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 120 }
  });

  const translateX = interpolate(slideIn, [0, 1], [-500, 0]);
  const opacity = interpolate(slideIn, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '80px',
        left: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        transform: `translateX(${translateX}px)`,
        opacity,
        zIndex: 25
      }}
    >
      <div
        style={{
          backgroundColor: '#FFDD00',
          color: '#111111',
          fontFamily: 'Helvetica Neue, Arial, sans-serif',
          fontWeight: 900,
          fontSize: '16px',
          letterSpacing: '2px',
          padding: '4px 12px',
          textTransform: 'uppercase'
        }}
      >
        {category}
      </div>
      <div
        style={{
          backgroundColor: '#111111',
          color: '#F3EFE0',
          fontFamily: 'Helvetica Neue, Arial, sans-serif',
          fontWeight: 700,
          fontSize: '28px',
          padding: '10px 20px',
          borderLeft: '6px solid #FFDD00',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          marginTop: '2px'
        }}
      >
        {text}
      </div>
    </div>
  );
};
