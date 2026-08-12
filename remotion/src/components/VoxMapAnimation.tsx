import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const VoxMapAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Path dash offset animation for glowing route line
  const dashOffset = interpolate(frame, [0, 90], [500, 0], { extrapolateRight: 'clamp' });

  // Pin drop spring animation
  const pinScale = spring({
    fps,
    frame: frame - 15,
    config: { damping: 10, stiffness: 180 }
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#0D1B2A',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
      }}
    >
      {/* Grid Lines */}
      <svg width="1920" height="1080" style={{ position: 'absolute', opacity: 0.2 }}>
        <defs>
          <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#FFDD00" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Animated SVG Path Line */}
      <svg width="1920" height="1080" style={{ position: 'absolute', zIndex: 12 }}>
        <path
          d="M 300 700 Q 800 200 1500 450"
          fill="none"
          stroke="#FFDD00"
          strokeWidth="6"
          strokeDasharray="500"
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />

        {/* Origin Pin */}
        <circle cx="300" cy="700" r="14" fill="#FFDD00" />
        <circle cx="300" cy="700" r="28" fill="none" stroke="#FFDD00" strokeWidth="2" opacity="0.6" />

        {/* Destination Target Pin with Spring Drop */}
        <g transform={`translate(1500, 450) scale(${Math.max(0, pinScale)})`}>
          <circle cx="0" cy="0" r="18" fill="#E63946" />
          <circle cx="0" cy="0" r="36" fill="none" stroke="#E63946" strokeWidth="3" opacity="0.7" />
          <text
            x="0"
            y="-50"
            textAnchor="middle"
            fill="#F3EFE0"
            fontFamily="Helvetica Neue, Arial"
            fontWeight="900"
            fontSize="24"
          >
            GLOBAL NODE: TAIWAN (TSMC)
          </text>
        </g>
      </svg>
    </div>
  );
};
