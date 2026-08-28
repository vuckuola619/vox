import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface LivingSceneOverlayProps {
  sceneType?: 'ship_canal' | 'people_banks' | 'sandstorm' | 'tugboats' | 'crane_port';
  durationInFrames: number;
}

export const LivingSceneOverlay: React.FC<LivingSceneOverlayProps> = ({
  sceneType = 'ship_canal',
  durationInFrames
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Stepped stop-motion frame ("cutting on twos" - 12 fps hold)
  const steppedFrame = Math.floor(frame / 2) * 2;

  // 1. SHIP HYDRODYNAMIC MOTION (Gentle pitch, roll & forward creep)
  const shipSway = Math.sin(steppedFrame / 8) * 1.8; // roll in degrees
  const shipHeave = Math.cos(steppedFrame / 10) * 4; // vertical bobbing in px
  const shipCreep = interpolate(frame, [0, durationInFrames], [-20, 20], { extrapolateRight: 'clamp' });

  // 2. PEOPLE ON BANKS ANIMATION (Stop-motion arm waving & gesturing)
  const person1Arm = Math.sin(steppedFrame / 4) * 30 - 20; // pointing arm
  const person2Wave = Math.sin(steppedFrame / 3) * 45;      // waving hand
  const person3Nod = Math.sin(steppedFrame / 5) * 10;       // head nodding

  // 3. WATER WAKE PARTICLES
  const wakeOffset1 = (steppedFrame * 3) % 180;
  const wakeOffset2 = ((steppedFrame * 3) + 90) % 180;

  // 4. DESERT SAND DUST DRIFT
  const dustX = (frame * 6) % 1920;

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
        zIndex: 16
      }}
    >
      {/* --- LAYER A: WATER WAKE RIPPLES AT WATERLINE --- */}
      <svg
        width="1920"
        height="1080"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0.75
        }}
      >
        {/* Bow Wave spray left */}
        <path
          d={`M ${480 + shipCreep} ${680 + shipHeave} Q ${420 + shipCreep - wakeOffset1} ${700} ${360 + shipCreep - wakeOffset1} ${740}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeDasharray="12 8"
          opacity={0.8}
        />
        {/* Bow Wave spray right */}
        <path
          d={`M ${650 + shipCreep} ${690 + shipHeave} Q ${720 + shipCreep + wakeOffset1} ${710} ${800 + shipCreep + wakeOffset1} ${750}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeDasharray="10 6"
          opacity={0.7}
        />
        {/* Secondary foam trail */}
        <path
          d={`M ${450 + shipCreep} ${710 + shipHeave} Q ${380 + shipCreep - wakeOffset2} ${730} ${300 + shipCreep - wakeOffset2} ${770}`}
          fill="none"
          stroke="#D7C79C"
          strokeWidth="2.5"
          strokeDasharray="8 6"
          opacity={0.5}
        />
      </svg>

      {/* --- LAYER B: ANIMATED PEOPLE CUTOUTS ON CANAL BANKS --- */}
      {/* Person 1: Surveyor on Left Bank */}
      <div
        style={{
          position: 'absolute',
          bottom: '240px',
          left: '140px',
          width: '70px',
          height: '110px',
          transform: `translateY(${person3Nod * 0.3}px)`,
          filter: 'drop-shadow(3px 4px 0px rgba(0,0,0,0.5))'
        }}
      >
        {/* Body/Coat */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '18px',
            width: '32px',
            height: '65px',
            backgroundColor: '#1A1A1A',
            border: '2px solid #EAE1C8',
            clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)'
          }}
        />
        {/* Head with hat */}
        <div
          style={{
            position: 'absolute',
            bottom: '65px',
            left: '20px',
            width: '28px',
            height: '28px',
            backgroundColor: '#D7C79C',
            border: '2px solid #1A1A1A',
            borderRadius: '50%',
            transform: `rotate(${person3Nod}deg)`
          }}
        >
          {/* Hat Brim */}
          <div style={{ position: 'absolute', top: '2px', left: '-6px', width: '40px', height: '6px', backgroundColor: '#B92220' }} />
        </div>
        {/* Pointing Arm with Binoculars */}
        <div
          style={{
            position: 'absolute',
            bottom: '45px',
            left: '35px',
            width: '34px',
            height: '8px',
            backgroundColor: '#BE8F2C',
            border: '1.5px solid #1A1A1A',
            transform: `rotate(${person1Arm}deg)`,
            transformOrigin: 'left center'
          }}
        />
      </div>

      {/* Person 2: Engineer / Observer on Right Bank */}
      <div
        style={{
          position: 'absolute',
          bottom: '220px',
          right: '180px',
          width: '70px',
          height: '110px',
          filter: 'drop-shadow(-3px 4px 0px rgba(0,0,0,0.5))'
        }}
      >
        {/* Body */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '18px',
            width: '32px',
            height: '65px',
            backgroundColor: '#B92220',
            border: '2px solid #1A1A1A',
            clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)'
          }}
        />
        {/* Head */}
        <div
          style={{
            position: 'absolute',
            bottom: '65px',
            left: '20px',
            width: '28px',
            height: '28px',
            backgroundColor: '#D7C79C',
            border: '2px solid #1A1A1A',
            borderRadius: '50%'
          }}
        />
        {/* Waving Arm */}
        <div
          style={{
            position: 'absolute',
            bottom: '50px',
            left: '10px',
            width: '32px',
            height: '8px',
            backgroundColor: '#1A1A1A',
            border: '1.5px solid #EAE1C8',
            transform: `rotate(${person2Wave}deg)`,
            transformOrigin: 'right center'
          }}
        />
      </div>

      {/* --- LAYER C: DESERT SAND DUST STREAM PARTICLES --- */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.35,
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '350px',
            left: `${(dustX * 1.5) % 2200 - 300}px`,
            width: '450px',
            height: '12px',
            backgroundColor: '#D7C79C',
            filter: 'blur(6px)',
            transform: 'rotate(-4deg)',
            opacity: 0.6
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '520px',
            left: `${((dustX + 600) * 1.8) % 2200 - 300}px`,
            width: '600px',
            height: '16px',
            backgroundColor: '#BE8F2C',
            filter: 'blur(8px)',
            transform: 'rotate(-6deg)',
            opacity: 0.45
          }}
        />
      </div>

      {/* --- LAYER D: RADAR SCANNER SWEEP AT BOTTOM --- */}
      <div
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '50px',
          width: '130px',
          height: '130px',
          borderRadius: '50%',
          border: '2px solid rgba(190, 143, 44, 0.6)',
          backgroundColor: 'rgba(26, 26, 26, 0.7)',
          boxShadow: '0 0 15px rgba(0,0,0,0.8)',
          overflow: 'hidden'
        }}
      >
        {/* Concentric rings */}
        <div style={{ position: 'absolute', top: '25px', left: '25px', width: '80px', height: '80px', borderRadius: '50%', border: '1px dashed rgba(190, 143, 44, 0.4)' }} />
        <div style={{ position: 'absolute', top: '45px', left: '45px', width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(185, 34, 32, 0.5)' }} />
        {/* Crosshairs */}
        <div style={{ position: 'absolute', top: '64px', left: 0, width: '130px', height: '1px', backgroundColor: 'rgba(190, 143, 44, 0.3)' }} />
        <div style={{ position: 'absolute', top: 0, left: '64px', width: '1px', height: '130px', backgroundColor: 'rgba(190, 143, 44, 0.3)' }} />
        {/* Rotating Radar Line */}
        <div
          style={{
            position: 'absolute',
            top: '65px',
            left: '65px',
            width: '65px',
            height: '2px',
            backgroundColor: '#BE8F2C',
            boxShadow: '0 0 8px #BE8F2C',
            transformOrigin: 'left center',
            transform: `rotate(${steppedFrame * 4}deg)`
          }}
        />
        {/* Pulsing Target Dot */}
        <div
          style={{
            position: 'absolute',
            top: '40px',
            left: '80px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#B92220',
            boxShadow: '0 0 8px #B92220',
            opacity: Math.sin(frame / 4) > 0 ? 1 : 0.2
          }}
        />
      </div>
    </div>
  );
};
