import React from 'react';
import { useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { RedMarkerOverlay } from './RedMarkerOverlay';

interface KineticHeadlineProps {
  heading?: string;
  category?: string;
}

export const KineticHeadline: React.FC<KineticHeadlineProps> = ({
  heading,
  category = "DOCUMENTARY EXPLAINER"
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!heading) return null;

  // Stop-motion pop-in with overshoot ("cutting on twos")
  const rawPop = spring({
    fps,
    frame: frame - 2,
    config: { damping: 11, stiffness: 220 }
  });
  const steppedPop = Math.floor(rawPop * 8) / 8;

  const scale = interpolate(steppedPop, [0, 1], [0.6, 1.0]);
  const opacity = interpolate(steppedPop, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '45px',
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `scale(${scale}) rotate(-0.8deg)`,
        opacity,
        zIndex: 29
      }}
    >
      {/* Editorial Headline Torn Paper Card */}
      <div
        style={{
          backgroundColor: '#EAE1C8',
          border: '3.5px solid #221D14',
          boxShadow: '6px 8px 0px #B92220',
          padding: '8px 28px',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          clipPath: 'polygon(0% 2%, 99% 0%, 100% 98%, 1% 100%)'
        }}
      >
        <span
          style={{
            fontFamily: 'Special Elite, monospace',
            fontSize: '12px',
            letterSpacing: '3px',
            color: '#726C5E',
            textTransform: 'uppercase',
            marginBottom: '2px'
          }}
        >
          {category}
        </span>
        <h1
          style={{
            fontFamily: 'Oswald, Helvetica Neue, Arial, sans-serif',
            fontWeight: 700,
            fontSize: '48px',
            color: '#221D14',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            margin: 0,
            lineHeight: 1.1
          }}
        >
          {heading}
        </h1>
      </div>

      {/* Red Hand-Drawn Marker Underline Swipe */}
      <RedMarkerOverlay type="underline" x={960} y={118} width={520} />
    </div>
  );
};
