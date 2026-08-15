import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface AlertWashProps {
  active?: boolean;
}

export const AlertWash: React.FC<AlertWashProps> = ({ active = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!active) return null;

  // Sudden 3-frame red flood wash with slow fade back to vignette
  const washOpacity = interpolate(
    frame,
    [0, 4, 18, 45],
    [0, 0.75, 0.45, 0],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#B92220',
        opacity: washOpacity,
        mixBlendMode: 'color-burn',
        pointerEvents: 'none',
        zIndex: 30
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          boxShadow: 'inset 0 0 120px rgba(34, 29, 20, 0.8)',
          border: '12px solid #B92220'
        }}
      />
    </div>
  );
};
