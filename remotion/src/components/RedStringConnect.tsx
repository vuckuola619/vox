import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const RedStringConnect: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const stringOffset = interpolate(frame, [5, 40], [600, 0], { extrapolateRight: 'clamp' });
  const pinDrop = spring({
    fps,
    frame: frame - 25,
    config: { damping: 10, stiffness: 220 }
  });

  return (
    <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0, zIndex: 18 }}>
      {/* Red Thread Connecting Pin 1 to Pin 2 */}
      <path
        d="M 400 650 Q 960 250 1520 480"
        fill="none"
        stroke="#B92220"
        strokeWidth="5"
        strokeDasharray="600"
        strokeDashoffset={stringOffset}
        strokeLinecap="round"
      />

      {/* Brass Pin 1 */}
      <circle cx="400" cy="650" r="10" fill="#BE8F2C" stroke="#221D14" strokeWidth="2" />

      {/* Brass Pin 2 with Spring Drop */}
      <g transform={`translate(1520, 480) scale(${Math.max(0, pinDrop)})`}>
        <circle cx="0" cy="0" r="14" fill="#B92220" stroke="#221D14" strokeWidth="3" />
        <rect x="-80" y="-55" width="160" height="32" fill="#EAE1C8" stroke="#B92220" strokeWidth="2" />
        <text
          x="0"
          y="-34"
          textAnchor="middle"
          fill="#B92220"
          fontFamily="Special Elite, monospace"
          fontWeight="bold"
          fontSize="14"
        >
          TARGET: TAIWAN
        </text>
      </g>
    </svg>
  );
};
