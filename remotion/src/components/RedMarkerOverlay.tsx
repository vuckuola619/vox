import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface RedMarkerOverlayProps {
  type?: 'circle' | 'underline' | 'box';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export const RedMarkerOverlay: React.FC<RedMarkerOverlayProps> = ({
  type = 'underline',
  x = 960,
  y = 540,
  width = 600,
  height = 80
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Hand-drawn stroke progress (stop-motion stepped easing)
  const rawProgress = interpolate(frame, [5, 25], [0, 1], { extrapolateRight: 'clamp' });
  const progress = Math.floor(rawProgress * 5) / 5; // stepped easing

  if (type === 'underline') {
    const strokeDash = width;
    const strokeOffset = strokeDash * (1 - progress);

    return (
      <svg
        width="1920"
        height="1080"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 24
        }}
      >
        <path
          d={`M ${x - width / 2} ${y} Q ${x} ${y + 6} ${x + width / 2} ${y - 2}`}
          fill="none"
          stroke="#B92220"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={strokeDash}
          strokeDashoffset={strokeOffset}
          opacity={0.9}
        />
        <path
          d={`M ${x - width / 2 + 10} ${y + 4} Q ${x} ${y + 8} ${x + width / 2 - 10} ${y + 2}`}
          fill="none"
          stroke="#BE8F2C"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={strokeDash}
          strokeDashoffset={strokeOffset}
          opacity={0.6}
        />
      </svg>
    );
  }

  if (type === 'circle') {
    const rx = width / 2;
    const ry = height / 2;
    const pathLength = 2 * Math.PI * Math.max(rx, ry);
    const strokeOffset = pathLength * (1 - progress);

    return (
      <svg
        width="1920"
        height="1080"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 24
        }}
      >
        <ellipse
          cx={x}
          cy={y}
          rx={rx}
          ry={ry}
          fill="none"
          stroke="#B92220"
          strokeWidth="8"
          strokeDasharray={pathLength}
          strokeDashoffset={strokeOffset}
          strokeLinecap="round"
          transform={`rotate(-4 ${x} ${y})`}
          opacity={0.95}
        />
      </svg>
    );
  }

  return null;
};
