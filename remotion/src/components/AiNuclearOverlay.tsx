import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface AiNuclearOverlayProps {
  sceneIndex: number;
  durationInFrames: number;
}

export const AiNuclearOverlay: React.FC<AiNuclearOverlayProps> = ({
  sceneIndex,
  durationInFrames
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 12fps stepped frame for authentic Vox stop-motion feel
  const steppedFrame = Math.floor(frame / 2) * 2;
  const time = frame / fps;

  // Global floating paper dust motes
  const dustMotes = [
    { x: (120 + frame * 0.8) % 1920, y: (300 + Math.sin(frame / 10) * 20) % 1080, size: 3, opacity: 0.4 },
    { x: (640 + frame * 0.5) % 1920, y: (180 + Math.cos(frame / 12) * 15) % 1080, size: 2, opacity: 0.35 },
    { x: (1200 + frame * 1.1) % 1920, y: (720 + Math.sin(frame / 8) * 25) % 1080, size: 4, opacity: 0.5 },
    { x: (1550 + frame * 0.7) % 1920, y: (450 + Math.cos(frame / 15) * 18) % 1080, size: 3, opacity: 0.4 },
    { x: (900 + frame * 0.9) % 1920, y: (820 + Math.sin(frame / 11) * 22) % 1080, size: 2.5, opacity: 0.35 }
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
        zIndex: 15
      }}
    >
      {/* GLOBAL: Ambient Floating Dust Motes */}
      {dustMotes.map((m, i) => (
        <div
          key={`dust-${i}`}
          style={{
            position: 'absolute',
            left: `${m.x}px`,
            top: `${m.y}px`,
            width: `${m.size}px`,
            height: `${m.size}px`,
            borderRadius: '50%',
            backgroundColor: '#FFF2C6',
            boxShadow: '0 0 6px rgba(255, 242, 198, 0.8)',
            opacity: m.opacity
          }}
        />
      ))}

      {/* ========================================================
          SCENE 1: THE HIDDEN ELECTRICAL SURGE
          - Pulsing lightning bolt from phone to power pylon
          - Blinking Thinking • • • indicator on phone
          ======================================================== */}
      {sceneIndex === 1 && (
        <>
          {/* Animated Lightning Bolt Arc */}
          <svg
            width="1920"
            height="1080"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              opacity: (steppedFrame % 6 < 4) ? 0.9 : 0.3,
              filter: 'drop-shadow(0 0 12px #FFD700)'
            }}
          >
            {/* Primary yellow electric arc */}
            <path
              d={`M 980 430 Q 1120 ${380 + (steppedFrame % 5) * 4} 1280 410 T 1440 ${370 + (steppedFrame % 4) * -5} T 1580 340`}
              fill="none"
              stroke="#FFE853"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Inner intense white core */}
            <path
              d={`M 980 430 Q 1120 ${380 + (steppedFrame % 5) * 4} 1280 410 T 1440 ${370 + (steppedFrame % 4) * -5} T 1580 340`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Spark branch */}
            <path
              d={`M 1280 410 L 1320 ${460 + (steppedFrame % 3) * 6} L 1360 480`}
              fill="none"
              stroke="#FFE853"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          {/* Electric Pylon Spark Burst at x: 1580, y: 340 */}
          <div
            style={{
              position: 'absolute',
              top: '325px',
              left: '1565px',
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              backgroundColor: '#FFE853',
              boxShadow: '0 0 25px 10px #FFD700',
              opacity: (steppedFrame % 4 === 0) ? 0.95 : 0.2,
              transform: `scale(${1 + (steppedFrame % 3) * 0.3})`
            }}
          />
        </>
      )}

      {/* ========================================================
          SCENE 2: 10X ENERGY MULTIPLIER (0.3 Wh Bulb vs 2.9 Wh Battery Stack)
          - Pulsing warm filament glow on the lightbulb
          - Glowing energy field around the 18650 battery stack
          ======================================================== */}
      {sceneIndex === 2 && (
        <>
          {/* Lightbulb Filament Warm Pulse (Center Left: x: 495, y: 550) */}
          <div
            style={{
              position: 'absolute',
              top: '510px',
              left: '460px',
              width: '80px',
              height: '90px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,230,120,0.85) 0%, rgba(255,180,50,0.4) 50%, rgba(255,140,0,0) 80%)',
              filter: 'blur(8px)',
              opacity: 0.7 + Math.sin(time * 6) * 0.25,
              transform: `scale(${1.0 + Math.sin(time * 4) * 0.08})`
            }}
          />

          {/* 18650 Battery Stack Energy Pulse (Center Right: x: 1410, y: 580) */}
          <div
            style={{
              position: 'absolute',
              top: '330px',
              left: '1220px',
              width: '380px',
              height: '520px',
              borderRadius: '24px',
              border: '2px solid rgba(80, 160, 255, 0.4)',
              boxShadow: '0 0 35px rgba(50, 140, 255, 0.35)',
              opacity: 0.6 + Math.cos(time * 5) * 0.3
            }}
          />

          {/* Battery Voltage Sparks */}
          <svg
            width="1920"
            height="1080"
            style={{ position: 'absolute', top: 0, left: 0, opacity: (steppedFrame % 4 < 2) ? 0.8 : 0.2 }}
          >
            <circle cx={1420 + (steppedFrame % 5) * 8} cy={360 + (steppedFrame % 3) * 6} r="3" fill="#64B5F6" filter="drop-shadow(0 0 6px #2196F3)" />
            <circle cx={1360 + (steppedFrame % 4) * -6} cy={520 + (steppedFrame % 5) * 5} r="2.5" fill="#90CAF9" filter="drop-shadow(0 0 6px #2196F3)" />
            <circle cx={1440 + (steppedFrame % 3) * 7} cy={680 + (steppedFrame % 4) * -4} r="3" fill="#64B5F6" filter="drop-shadow(0 0 6px #2196F3)" />
          </svg>
        </>
      )}

      {/* ========================================================
          SCENE 3: INDUSTRIAL CONSUMPTION ($200B Server Pyramid)
          - Blinking green/blue LED grid across server racks
          - Twitching Westinghouse kilowatt meter needle
          ======================================================== */}
      {sceneIndex === 3 && (
        <>
          {/* Server Rack Blinking LED Grid Matrix */}
          {Array.from({ length: 18 }).map((_, idx) => {
            const col = idx % 6;
            const row = Math.floor(idx / 6);
            const x = 760 + col * 75 + (row * 15);
            const y = 480 + row * 85;
            const isLit = (steppedFrame + idx * 3) % 4 !== 0;

            return (
              <div
                key={`led-${idx}`}
                style={{
                  position: 'absolute',
                  top: `${y}px`,
                  left: `${x}px`,
                  width: '6px',
                  height: '4px',
                  borderRadius: '1px',
                  backgroundColor: idx % 3 === 0 ? '#00E676' : '#29B6F6',
                  boxShadow: isLit ? `0 0 8px ${idx % 3 === 0 ? '#00E676' : '#29B6F6'}` : 'none',
                  opacity: isLit ? 0.9 : 0.2
                }}
              />
            );
          })}

          {/* Kilowatt Meter Needle Jitter (Bottom Right: x: 1675, y: 640) */}
          <div
            style={{
              position: 'absolute',
              top: '630px',
              left: '1675px',
              width: '120px',
              height: '4px',
              backgroundColor: '#D32F2F',
              boxShadow: '0 0 8px rgba(211, 47, 47, 0.8)',
              transformOrigin: 'left center',
              transform: `rotate(${-28 + Math.sin(time * 18) * 4 + (steppedFrame % 5) * 1.5}deg)`
            }}
          />
        </>
      )}

      {/* ========================================================
          SCENE 4: THE GRID CAPACITY LIMIT
          - High Voltage Danger Warning Flash
          - Electric arcing sparks across substation transformers
          ======================================================== */}
      {sceneIndex === 4 && (
        <>
          {/* Danger High Voltage Warning Sign Glow (Center Right: x: 1440, y: 390) */}
          <div
            style={{
              position: 'absolute',
              top: '240px',
              left: '1300px',
              width: '270px',
              height: '310px',
              border: '3px solid rgba(220, 40, 40, 0.7)',
              boxShadow: '0 0 30px rgba(220, 40, 40, 0.4)',
              opacity: (steppedFrame % 6 < 3) ? 0.85 : 0.3
            }}
          />

          {/* Transformer Arc Sparks (Top Right: x: 1470, y: 120) */}
          <svg
            width="1920"
            height="1080"
            style={{ position: 'absolute', top: 0, left: 0, opacity: (steppedFrame % 5 < 2) ? 0.9 : 0.1 }}
          >
            <path
              d={`M 1430 ${120 + (steppedFrame % 3) * 4} Q 1460 ${90 + (steppedFrame % 4) * -6} 1490 120`}
              fill="none"
              stroke="#FFF176"
              strokeWidth="3.5"
              filter="drop-shadow(0 0 8px #FFD54F)"
            />
            <circle cx="1460" cy="100" r="4" fill="#FFFFFF" filter="drop-shadow(0 0 10px #FFE082)" />
          </svg>
        </>
      )}

      {/* ========================================================
          SCENE 5: BUYING THE POWER PLANTS (Nuclear Cooling Towers)
          - Billowing steam plumes rising softly from cooling towers
          - Substation high voltage humming pulse
          ======================================================== */}
      {sceneIndex === 5 && (
        <>
          {/* Billowing Nuclear Steam Plume 1 (Tower 1: x: 1240, y: 220) */}
          <div
            style={{
              position: 'absolute',
              top: `${140 - (frame * 1.2) % 180}px`,
              left: '1180px',
              width: '160px',
              height: '140px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(240,240,240,0.2) 60%, rgba(255,255,255,0) 80%)',
              filter: 'blur(16px)',
              opacity: interpolate((frame * 1.2) % 180, [0, 90, 180], [0.1, 0.5, 0.0], { extrapolateRight: 'clamp' }),
              transform: `scale(${1 + ((frame * 1.2) % 180) / 100})`
            }}
          />

          {/* Billowing Nuclear Steam Plume 2 (Tower 2: x: 1460, y: 260) */}
          <div
            style={{
              position: 'absolute',
              top: `${170 - ((frame + 60) * 1.1) % 180}px`,
              left: '1400px',
              width: '180px',
              height: '150px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, rgba(240,240,240,0.18) 60%, rgba(255,255,255,0) 80%)',
              filter: 'blur(18px)',
              opacity: interpolate(((frame + 60) * 1.1) % 180, [0, 90, 180], [0.1, 0.45, 0.0], { extrapolateRight: 'clamp' }),
              transform: `scale(${1 + (((frame + 60) * 1.1) % 180) / 90})`
            }}
          />
        </>
      )}
    </div>
  );
};
