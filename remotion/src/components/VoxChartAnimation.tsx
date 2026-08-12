import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

export const VoxChartAnimation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Animated bar growth height
  const bar1 = interpolate(frame, [0, 45], [0, 320], { extrapolateRight: 'clamp' });
  const bar2 = interpolate(frame, [10, 55], [0, 580], { extrapolateRight: 'clamp' });
  const bar3 = interpolate(frame, [20, 65], [0, 820], { extrapolateRight: 'clamp' });

  // Counter number animation
  const counterVal = Math.round(interpolate(frame, [0, 60], [12, 580], { extrapolateRight: 'clamp' }));

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: '#111111',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10
      }}
    >
      <div style={{ position: 'absolute', top: '100px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Helvetica Neue, Arial', color: '#F3EFE0', fontSize: '36px', letterSpacing: '2px' }}>
          GLOBAL SEMICONDUCTOR CAPITAL EXPENDITURE ($B)
        </h2>
        <div style={{ color: '#FFDD00', fontSize: '72px', fontWeight: 900, fontFamily: 'Impact, Arial' }}>
          ${counterVal} BILLION
        </div>
      </div>

      {/* Dynamic Bar Charts */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '60px',
          height: '500px',
          marginTop: '120px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '120px', height: `${bar1}px`, backgroundColor: '#1D3557', borderRadius: '6px 6px 0 0' }} />
          <span style={{ color: '#F3EFE0', marginTop: '12px', fontWeight: 700 }}>2020</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '120px', height: `${bar2}px`, backgroundColor: '#457B9D', borderRadius: '6px 6px 0 0' }} />
          <span style={{ color: '#F3EFE0', marginTop: '12px', fontWeight: 700 }}>2023</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: '120px', height: `${bar3}px`, backgroundColor: '#FFDD00', borderRadius: '6px 6px 0 0', boxShadow: '0 0 30px rgba(255, 221, 0, 0.5)' }} />
          <span style={{ color: '#FFDD00', marginTop: '12px', fontWeight: 900, fontSize: '20px' }}>2026 (EST)</span>
        </div>
      </div>
    </div>
  );
};
