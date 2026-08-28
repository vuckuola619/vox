import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface EditorialDustParticlesProps {
  durationInFrames?: number;
}

export const EditorialDustParticles: React.FC<EditorialDustParticlesProps> = () => {
  const frame = useCurrentFrame();

  // Floating tactile dust/paper motes (gentle organic drift)
  const dustMotes = [
    { x: (180 + frame * 0.7) % 1920, y: (220 + Math.sin(frame / 12) * 18) % 1080, size: 2.5, opacity: 0.35 },
    { x: (620 + frame * 0.5) % 1920, y: (140 + Math.cos(frame / 15) * 12) % 1080, size: 2.0, opacity: 0.25 },
    { x: (1120 + frame * 0.9) % 1920, y: (720 + Math.sin(frame / 10) * 20) % 1080, size: 3.0, opacity: 0.30 },
    { x: (1580 + frame * 0.6) % 1920, y: (450 + Math.cos(frame / 14) * 15) % 1080, size: 2.2, opacity: 0.28 },
    { x: (840 + frame * 0.8) % 1920, y: (820 + Math.sin(frame / 13) * 16) % 1080, size: 2.0, opacity: 0.32 },
    { x: (340 + frame * 0.4) % 1920, y: (560 + Math.cos(frame / 11) * 14) % 1080, size: 1.8, opacity: 0.22 },
    { x: (1340 + frame * 0.75) % 1920, y: (290 + Math.sin(frame / 16) * 19) % 1080, size: 2.4, opacity: 0.27 }
  ];

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 14
      }}
    >
      {dustMotes.map((m, i) => (
        <div
          key={`dust-mote-${i}`}
          style={{
            position: 'absolute',
            left: `${m.x}px`,
            top: `${m.y}px`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            borderRadius: '50%',
            backgroundColor: '#F5E6CA',
            boxShadow: '0 0 4px rgba(245, 230, 202, 0.5)',
            opacity: m.opacity
          }}
        />
      ))}
    </div>
  );
};
