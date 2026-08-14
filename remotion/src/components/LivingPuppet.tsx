import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface LivingPuppetProps {
  gesture?: 'head_nod' | 'arm_point' | 'idle_sway';
}

export const LivingPuppet: React.FC<LivingPuppetProps> = ({ gesture = 'arm_point' }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Stop-motion 2-3 frame stepped hold cadence ("cutting on twos")
  const steppedFrame = Math.floor(frame / 3) * 3;

  // Joint angle calculations based on steppedFrame
  let armAngle = 0;
  let headAngle = 0;

  if (gesture === 'arm_point') {
    armAngle = steppedFrame < 30 ? Math.sin(steppedFrame / 5) * 25 - 15 : -35;
  } else if (gesture === 'head_nod') {
    headAngle = Math.sin(steppedFrame / 6) * 12;
  } else {
    // idle sway
    armAngle = Math.sin(steppedFrame / 10) * 8;
    headAngle = Math.cos(steppedFrame / 10) * 5;
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '80px',
        left: '120px',
        width: '320px',
        height: '480px',
        pointerEvents: 'none',
        zIndex: 22
      }}
    >
      {/* Torso (Cutout) */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '80px',
          width: '160px',
          height: '260px',
          backgroundColor: '#1A1A1A',
          border: '3px solid #EAE1C8',
          boxShadow: '4px 6px 0px #B92220',
          clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)'
        }}
      />

      {/* Head Cutout (Jointed at neck with headAngle pivot) */}
      <div
        style={{
          position: 'absolute',
          bottom: '260px',
          left: '100px',
          width: '120px',
          height: '130px',
          backgroundColor: '#D7C79C',
          border: '3px solid #1A1A1A',
          borderRadius: '50% 50% 40% 40%',
          transform: `rotate(${headAngle}deg)`,
          transformOrigin: 'bottom center',
          boxShadow: '3px 4px 0px #B92220'
        }}
      >
        {/* Black Censor Bar */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '10px',
            width: '100px',
            height: '24px',
            backgroundColor: '#1A1A1A'
          }}
        />
      </div>

      {/* Arm Cutout (Jointed at shoulder with armAngle pivot) */}
      <div
        style={{
          position: 'absolute',
          bottom: '180px',
          left: '180px',
          width: '140px',
          height: '32px',
          backgroundColor: '#BE8F2C',
          border: '3px solid #1A1A1A',
          transform: `rotate(${armAngle}deg)`,
          transformOrigin: 'left center',
          boxShadow: '3px 4px 0px #1A1A1A'
        }}
      >
        {/* Hand Pointer */}
        <div
          style={{
            position: 'absolute',
            right: '-20px',
            top: '4px',
            width: '24px',
            height: '24px',
            backgroundColor: '#B92220',
            borderRadius: '50%'
          }}
        />
      </div>
    </div>
  );
};
