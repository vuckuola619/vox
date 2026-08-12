import React from 'react';
import { useCurrentFrame } from 'remotion';

export const FilmGrainOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle opacity flickering for tactile documentary feel
  const grainOpacity = 0.05 + (frame % 3) * 0.01;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 30
      }}
    >
      {/* Vignette Shadow */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, transparent 60%, rgba(0,0,0,0.65) 100%)'
        }}
      />

      {/* Film Grain Simulated Pattern */}
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          opacity: grainOpacity,
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 0)`,
          backgroundSize: '4px 4px'
        }}
      />
    </div>
  );
};
