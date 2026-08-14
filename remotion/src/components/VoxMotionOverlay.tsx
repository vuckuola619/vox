import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { AlertWash } from './AlertWash';
import { RedMarkerOverlay } from './RedMarkerOverlay';
import { TapeFragments } from './TapeFragments';
import { LivingPuppet } from './LivingPuppet';

export interface OverlayConfig {
  type?: string;
  label?: string;
  coords?: string;
  distance?: string;
  width?: string;
  stat?: string;
  markerType?: 'circle' | 'underline' | 'box';
  gesture?: 'head_nod' | 'arm_point' | 'idle_sway';
  alertWash?: boolean;
  [key: string]: any;
}

interface VoxMotionOverlayProps {
  config?: OverlayConfig;
  durationInFrames: number;
}

export const VoxMotionOverlay: React.FC<VoxMotionOverlayProps> = ({ config, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!config || !config.type) return null;

  const type = config.type;

  // 1. ROUTE TRACER OVERLAY
  if (type === 'route_tracer') {
    const dashOffset = interpolate(frame, [0, Math.min(60, durationInFrames)], [800, 0], { extrapolateRight: 'clamp' });
    const textOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: 'clamp' });
    const pulseScale = 1 + 0.15 * Math.sin(frame / 5);

    return (
      <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 15 }}>
        <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Main Glowing Shipping Line */}
          <path
            d="M 250 820 Q 960 300 1670 450"
            fill="none"
            stroke="#BE8F2C"
            strokeWidth="8"
            strokeDasharray="800"
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
          <path
            d="M 250 820 Q 960 300 1670 450"
            fill="none"
            stroke="#B92220"
            strokeWidth="4"
            strokeDasharray="16 12"
            strokeDashoffset={dashOffset / 2}
            strokeLinecap="round"
          />
          {/* Start Node */}
          <circle cx="250" cy="820" r="14" fill="#BE8F2C" />
          <circle cx="250" cy="820" r={24 * pulseScale} fill="none" stroke="#BE8F2C" strokeWidth="2" opacity="0.7" />

          {/* End Node */}
          <circle cx="1670" cy="450" r="14" fill="#B92220" />
          <circle cx="1670" cy="450" r={28 * pulseScale} fill="none" stroke="#B92220" strokeWidth="2" opacity="0.8" />
        </svg>

        {/* Distance Badge Callout */}
        <div
          style={{
            position: 'absolute',
            top: '360px',
            left: '900px',
            opacity: textOpacity,
            backgroundColor: '#1A1A1A',
            border: '3px solid #BE8F2C',
            boxShadow: '4px 6px 0px #B92220',
            padding: '8px 24px',
            color: '#EAE1C8',
            fontFamily: 'Oswald, Helvetica Neue, Arial, sans-serif',
            fontWeight: 700,
            fontSize: '26px',
            letterSpacing: '2px',
            textTransform: 'uppercase'
          }}
        >
          MARITIME ROUTE: {config.distance || '580 NAUTICAL MILES'}
        </div>
      </div>
    );
  }

  // 2. CHOKEPOINT RULER / MEASUREMENT OVERLAY
  if (type === 'chokepoint_ruler') {
    const scaleX = interpolate(frame, [0, Math.min(45, durationInFrames)], [0, 1], { extrapolateRight: 'clamp' });
    const badgePop = spring({ fps, frame: frame - 15, config: { damping: 12, stiffness: 200 } });

    return (
      <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 15 }}>
        <div
          style={{
            position: 'absolute',
            top: '520px',
            left: '360px',
            width: '1200px',
            height: '4px',
            backgroundColor: '#B92220',
            transform: `scaleX(${scaleX})`,
            transformOrigin: 'center center',
            boxShadow: '0 0 12px rgba(185, 34, 32, 0.8)'
          }}
        >
          {/* Tick End Markers */}
          <div style={{ position: 'absolute', left: 0, top: '-20px', width: '4px', height: '44px', backgroundColor: '#BE8F2C' }} />
          <div style={{ position: 'absolute', right: 0, top: '-20px', width: '4px', height: '44px', backgroundColor: '#BE8F2C' }} />
        </div>

        {/* Ruler Callout Box */}
        <div
          style={{
            position: 'absolute',
            top: '430px',
            left: '50%',
            transform: `translateX(-50%) scale(${Math.max(0, badgePop)})`,
            backgroundColor: '#B92220',
            color: '#FFFFFF',
            padding: '10px 30px',
            fontFamily: 'Oswald, Arial, sans-serif',
            fontWeight: 800,
            fontSize: '32px',
            letterSpacing: '3px',
            border: '3px solid #1A1A1A',
            boxShadow: '6px 6px 0px #1A1A1A'
          }}
        >
          CRITICAL WIDTH: {config.width || '2.8 KM (PHILLIPS CHANNEL)'}
        </div>
      </div>
    );
  }

  // 3. MAP HIGHLIGHT & COORDINATES OVERLAY
  if (type === 'map_highlight' || type === 'coordinates_pin') {
    const pulseRadius = 30 + 15 * Math.sin(frame / 4);
    const badgeOpacity = interpolate(frame, [10, 30], [0, 1], { extrapolateRight: 'clamp' });

    return (
      <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 15 }}>
        <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0 }}>
          {/* Sonar Reticle Rings */}
          <circle cx="960" cy="540" r="16" fill="#B92220" />
          <circle cx="960" cy="540" r={pulseRadius} fill="none" stroke="#BE8F2C" strokeWidth="3" opacity="0.8" />
          <circle cx="960" cy="540" r={pulseRadius * 1.8} fill="none" stroke="#B92220" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.6" />
          {/* Crosshair lines */}
          <line x1="880" y1="540" x2="1040" y2="540" stroke="#BE8F2C" strokeWidth="2" />
          <line x1="960" y1="460" x2="960" y2="620" stroke="#BE8F2C" strokeWidth="2" />
        </svg>

        {/* Coordinates Tag */}
        <div
          style={{
            position: 'absolute',
            top: '600px',
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: badgeOpacity,
            backgroundColor: '#1A1A1A',
            border: '2px solid #BE8F2C',
            color: '#EAE1C8',
            padding: '6px 20px',
            fontFamily: 'Oswald, Helvetica Neue, Arial, sans-serif',
            fontSize: '22px',
            letterSpacing: '2px'
          }}
        >
          {config.label || 'STRAIT OF MALACCA'} • {config.coords || '2.5° N, 101.5° E'}
        </div>
      </div>
    );
  }

  // 4. STAT CALLOUT OVERLAY
  if (type === 'stat_callout') {
    const counterVal = Math.round(interpolate(frame, [0, Math.min(45, durationInFrames)], [0, 100], { extrapolateRight: 'clamp' }));

    return (
      <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 15 }}>
        <div
          style={{
            position: 'absolute',
            bottom: '140px',
            right: '100px',
            backgroundColor: '#EAE1C8',
            border: '4px solid #1A1A1A',
            boxShadow: '8px 8px 0px #B92220',
            padding: '16px 32px',
            textAlign: 'right'
          }}
        >
          <div style={{ fontFamily: 'Oswald, Arial', fontSize: '20px', color: '#1A1A1A', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>
            {config.stat || 'GLOBAL TRADE VOLUME'}
          </div>
          <div style={{ fontFamily: 'Oswald, Impact, Arial', fontSize: '48px', color: '#B92220', fontWeight: 900, marginTop: '4px' }}>
            {config.value || '60% OF WORLD MARITIME TRADE'}
          </div>
        </div>
      </div>
    );
  }

  // 5. ALERT WASH OVERLAY
  if (type === 'alert_wash' || config.alertWash) {
    return <AlertWash active={true} />;
  }

  // 6. RED MARKER OVERLAY
  if (type === 'red_marker') {
    return <RedMarkerOverlay type={config.markerType || 'underline'} y={520} />;
  }

  // 7. TAPE FRAGMENTS OVERLAY
  if (type === 'tape_fragments') {
    return <TapeFragments />;
  }

  // 8. LIVING PUPPET PAPER MARIONETTE OVERLAY
  if (type === 'living_puppet') {
    return <LivingPuppet gesture={config.gesture || 'arm_point'} />;
  }

  return null;
};
