import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

interface OnkaloLevel2OverlayProps {
  sceneIndex: number;
  durationInFrames: number;
}

export const OnkaloLevel2Overlay: React.FC<OnkaloLevel2OverlayProps> = ({
  sceneIndex,
  durationInFrames
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 12fps stepped frame for authentic Vox stop-motion feel
  const steppedFrame = Math.floor(frame / 2) * 2;
  const time = frame / fps;

  // Floating tactile dust/paper motes
  const dustMotes = [
    { x: (140 + frame * 0.9) % 1920, y: (280 + Math.sin(frame / 9) * 20) % 1080, size: 3, opacity: 0.45 },
    { x: (580 + frame * 0.6) % 1920, y: (160 + Math.cos(frame / 11) * 15) % 1080, size: 2.5, opacity: 0.35 },
    { x: (1180 + frame * 1.2) % 1920, y: (690 + Math.sin(frame / 7) * 25) % 1080, size: 3.5, opacity: 0.5 },
    { x: (1620 + frame * 0.8) % 1920, y: (420 + Math.cos(frame / 13) * 18) % 1080, size: 3, opacity: 0.4 },
    { x: (880 + frame * 1.0) % 1920, y: (840 + Math.sin(frame / 10) * 22) % 1080, size: 2.5, opacity: 0.4 }
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
        zIndex: 12
      }}
    >
      {/* GLOBAL: Ambient Floating Paper Motes */}
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
            backgroundColor: '#FFE8A3',
            boxShadow: '0 0 6px rgba(255, 232, 163, 0.8)',
            opacity: m.opacity
          }}
        />
      ))}

      {/* ========================================================
          SCENE 1: PLUTONIUM-239 DECAY CHAIN
          - 7 Pulsing radioactive atomic nucleus cores
          - Streaming alpha particles (α) along decay arrows
          ======================================================== */}
      {sceneIndex === 1 && (
        <>
          {/* Radioactive Core Glows (Pu-239 through Pb-207) */}
          {[
            { x: 310, y: 535, r: 42, color: '#FFD700' },
            { x: 530, y: 535, r: 36, color: '#FFA000' },
            { x: 745, y: 535, r: 36, color: '#FF8F00' },
            { x: 960, y: 535, r: 34, color: '#FF6F00' },
            { x: 1175, y: 535, r: 34, color: '#F57C00' },
            { x: 1390, y: 535, r: 32, color: '#E65100' },
            { x: 1605, y: 535, r: 30, color: '#4CAF50' }
          ].map((node, idx) => {
            const pulse = 1 + 0.18 * Math.sin(time * 6 + idx * 0.8);
            return (
              <div
                key={`pu-core-${idx}`}
                style={{
                  position: 'absolute',
                  left: `${node.x - node.r * pulse}px`,
                  top: `${node.y - node.r * pulse}px`,
                  width: `${node.r * 2 * pulse}px`,
                  height: `${node.r * 2 * pulse}px`,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${node.color} 0%, rgba(255,215,0,0.3) 50%, rgba(255,215,0,0) 75%)`,
                  filter: 'blur(6px)',
                  opacity: 0.65 + 0.25 * Math.sin(time * 5 + idx)
                }}
              />
            );
          })}

          {/* Streaming Alpha Decay Particles */}
          <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0 }}>
            {Array.from({ length: 8 }).map((_, i) => {
              const startX = 310;
              const endX = 1605;
              const particleX = startX + ((frame * 6 + i * 160) % (endX - startX));
              const particleY = 535 + Math.sin(particleX / 40 + i) * 8;
              return (
                <g key={`alpha-p-${i}`}>
                  <circle
                    cx={particleX}
                    cy={particleY}
                    r={3.5}
                    fill="#FFF59D"
                    filter="drop-shadow(0 0 8px #FFEB3B)"
                  />
                  <circle
                    cx={particleX}
                    cy={particleY}
                    r={1.5}
                    fill="#FFFFFF"
                  />
                </g>
              );
            })}
          </svg>
        </>
      )}

      {/* ========================================================
          SCENE 2: HUMAN CIVILIZATION TIMELINE VS 100K YEARS
          - Billowing steam plumes rising from cooling towers
          - Desert atmospheric heat haze over pyramids
          - Pulsing radioactive hazard stamp
          ======================================================== */}
      {sceneIndex === 2 && (
        <>
          {/* Cooling Tower 1 Steam Plume (x: 1040, y: 260) */}
          <div
            style={{
              position: 'absolute',
              top: `${210 - (frame * 1.4) % 160}px`,
              left: '1010px',
              width: '120px',
              height: '110px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, rgba(230,230,230,0.2) 60%, rgba(255,255,255,0) 80%)',
              filter: 'blur(12px)',
              opacity: interpolate((frame * 1.4) % 160, [0, 80, 160], [0.1, 0.55, 0.0], { extrapolateRight: 'clamp' }),
              transform: `scale(${1 + ((frame * 1.4) % 160) / 90})`
            }}
          />

          {/* Cooling Tower 2 Steam Plume (x: 1110, y: 280) */}
          <div
            style={{
              position: 'absolute',
              top: `${230 - ((frame + 45) * 1.3) % 160}px`,
              left: '1080px',
              width: '130px',
              height: '120px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, rgba(230,230,230,0.18) 60%, rgba(255,255,255,0) 80%)',
              filter: 'blur(14px)',
              opacity: interpolate(((frame + 45) * 1.3) % 160, [0, 80, 160], [0.1, 0.5, 0.0], { extrapolateRight: 'clamp' }),
              transform: `scale(${1 + (((frame + 45) * 1.3) % 160) / 80})`
            }}
          />

          {/* Pyramid Desert Heat Haze Shimmer (Left: x: 240, y: 380) */}
          <div
            style={{
              position: 'absolute',
              top: '320px',
              left: '160px',
              width: '360px',
              height: '180px',
              background: 'radial-gradient(ellipse, rgba(255,210,120,0.25) 0%, rgba(255,180,60,0.08) 60%, rgba(255,180,60,0) 80%)',
              filter: 'blur(10px)',
              opacity: 0.5 + Math.sin(time * 8) * 0.25,
              transform: `scaleY(${1 + Math.sin(time * 12) * 0.08})`
            }}
          />

          {/* Yellow Radioactive Stamp Pulse (Top Right: x: 1195, y: 115) */}
          <div
            style={{
              position: 'absolute',
              top: '90px',
              left: '1170px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,220,0,0.6) 0%, rgba(255,180,0,0) 70%)',
              filter: 'blur(8px)',
              opacity: 0.6 + Math.sin(time * 6) * 0.35,
              transform: `scale(${1 + Math.sin(time * 6) * 0.15})`
            }}
          />
        </>
      )}

      {/* ========================================================
          SCENE 3: FAILURE OF SURFACE STORAGE (CHERENKOV POOL)
          - Intense electric blue shimmering Cherenkov radiation glow
          - Power grid lightning sparks
          - Red failure box alarm pulse
          ======================================================== */}
      {sceneIndex === 3 && (
        <>
          {/* Cherenkov Radiation Electric Blue Pool Glow (Center: x: 740, y: 550) */}
          <div
            style={{
              position: 'absolute',
              top: '460px',
              left: '520px',
              width: '420px',
              height: '240px',
              borderRadius: '16px',
              background: 'radial-gradient(ellipse, rgba(0, 195, 255, 0.65) 0%, rgba(0, 110, 255, 0.35) 50%, rgba(0, 60, 200, 0) 80%)',
              filter: 'blur(14px)',
              opacity: 0.75 + Math.sin(time * 7) * 0.2,
              transform: `scale(${1.0 + Math.sin(time * 5) * 0.05})`
            }}
          />

          {/* Fuel Rod Assemblies Luminescent Beams */}
          <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0 }}>
            {Array.from({ length: 10 }).map((_, i) => {
              const rodX = 570 + i * 32;
              const beamAlpha = 0.5 + 0.3 * Math.sin(time * 8 + i);
              return (
                <line
                  key={`rod-beam-${i}`}
                  x1={rodX}
                  y1={650}
                  x2={rodX}
                  y2={500}
                  stroke="#E0F7FA"
                  strokeWidth={3}
                  opacity={beamAlpha}
                  filter="drop-shadow(0 0 10px #00E5FF)"
                />
              );
            })}
          </svg>

          {/* Power Grid Electric Sparks (Right Tower: x: 1020, y: 220) */}
          <div
            style={{
              position: 'absolute',
              top: '190px',
              left: '990px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#FFF59D',
              boxShadow: '0 0 25px 8px #FFD700',
              opacity: (steppedFrame % 5 < 2) ? 0.9 : 0.15,
              transform: `scale(${1 + (steppedFrame % 4) * 0.25})`
            }}
          />

          {/* Red Failure Warning Box Pulse (Right: x: 1220, y: 460) */}
          <div
            style={{
              position: 'absolute',
              top: '410px',
              left: '1130px',
              width: '180px',
              height: '110px',
              border: '3px solid rgba(244, 67, 54, 0.8)',
              boxShadow: '0 0 25px rgba(244, 67, 54, 0.5)',
              opacity: (steppedFrame % 6 < 3) ? 0.85 : 0.2
            }}
          />
        </>
      )}

      {/* ========================================================
          SCENE 4: PASSIVE GEOLOGICAL ISOLATION
          - 2.5D Subterranean bedrock strata depth scanning line
          - Metallic copper canister light reflection sweep
          - Zero-maintenance equilibrium badge glow
          ======================================================== */}
      {sceneIndex === 4 && (
        <>
          {/* Bedrock Strata Horizontal Laser Scan Line (400-500m depth) */}
          <div
            style={{
              position: 'absolute',
              top: `${420 + ((frame * 2) % 240)}px`,
              left: '260px',
              width: '900px',
              height: '2px',
              background: 'linear-gradient(90deg, rgba(255,215,0,0) 0%, rgba(255,215,0,0.85) 50%, rgba(255,215,0,0) 100%)',
              boxShadow: '0 0 12px #FFD700',
              opacity: interpolate(((frame * 2) % 240), [0, 120, 240], [0.2, 0.8, 0.2], { extrapolateRight: 'clamp' })
            }}
          />

          {/* Copper Canister Metallic Sheen Reflection (Center Right: x: 890, y: 550) */}
          <div
            style={{
              position: 'absolute',
              top: '480px',
              left: `${840 + ((frame * 1.5) % 120)}px`,
              width: '25px',
              height: '180px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,220,180,0.6) 50%, rgba(255,255,255,0) 100%)',
              filter: 'blur(4px)',
              transform: 'skewX(-15deg)',
              opacity: 0.75
            }}
          />

          {/* Granite Bedrock Ambient Fissure Glow */}
          <div
            style={{
              position: 'absolute',
              top: '450px',
              left: '420px',
              width: '560px',
              height: '280px',
              background: 'radial-gradient(ellipse, rgba(255, 183, 77, 0.18) 0%, rgba(255, 183, 77, 0) 70%)',
              filter: 'blur(16px)',
              opacity: 0.6 + Math.sin(time * 4) * 0.2
            }}
          />
        </>
      )}

      {/* ========================================================
          SCENE 5: 100,000-YEAR TIME HORIZON
          - Twinkling night sky stars
          - Auroral atmospheric wave over the Finnish horizon
          - Volumetric beam of light shining into Onkalo tomb shaft
          ======================================================== */}
      {sceneIndex === 5 && (
        <>
          {/* Night Sky Twinkling Stars (Top Left/Center Sky) */}
          <svg width="1920" height="1080" style={{ position: 'absolute', top: 0, left: 0 }}>
            {[
              { x: 380, y: 140, r: 2.5, phase: 0 },
              { x: 520, y: 110, r: 2.0, phase: 1.5 },
              { x: 680, y: 160, r: 3.0, phase: 3.0 },
              { x: 820, y: 125, r: 2.2, phase: 4.2 },
              { x: 960, y: 150, r: 2.8, phase: 2.1 },
              { x: 1100, y: 105, r: 2.0, phase: 5.0 },
              { x: 1250, y: 135, r: 3.2, phase: 0.8 }
            ].map((star, i) => {
              const starOpacity = 0.3 + 0.7 * Math.pow(Math.sin(time * 4 + star.phase), 2);
              return (
                <g key={`star-${i}`}>
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={star.r}
                    fill="#FFFFFF"
                    opacity={starOpacity}
                    filter="drop-shadow(0 0 6px #FFF59D)"
                  />
                  <circle
                    cx={star.x}
                    cy={star.y}
                    r={star.r * 1.8}
                    fill="none"
                    stroke="#FFF9C4"
                    strokeWidth={1}
                    opacity={starOpacity * 0.6}
                  />
                </g>
              );
            })}
          </svg>

          {/* Soft Aurora Atmospheric Glow (Horizon Sky: x: 700, y: 130) */}
          <div
            style={{
              position: 'absolute',
              top: '80px',
              left: '320px',
              width: '980px',
              height: '120px',
              background: 'radial-gradient(ellipse, rgba(0, 230, 118, 0.22) 0%, rgba(0, 200, 83, 0.1) 50%, rgba(0, 0, 0, 0) 80%)',
              filter: 'blur(16px)',
              opacity: 0.55 + Math.sin(time * 3) * 0.25,
              transform: `scaleX(${1 + Math.sin(time * 2) * 0.1})`
            }}
          />

          {/* Volumetric Beam of Light Piercing Tomb Shaft (Right: x: 1350, y: 380) */}
          <div
            style={{
              position: 'absolute',
              top: '240px',
              left: '1310px',
              width: '90px',
              height: '420px',
              background: 'linear-gradient(180deg, rgba(255, 238, 88, 0.45) 0%, rgba(255, 213, 79, 0.2) 60%, rgba(255, 213, 79, 0) 100%)',
              filter: 'blur(10px)',
              transform: 'rotate(8deg)',
              opacity: 0.65 + Math.sin(time * 5) * 0.25
            }}
          />
        </>
      )}
    </div>
  );
};
