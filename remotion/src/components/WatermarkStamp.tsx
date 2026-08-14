import React from 'react';

export const WatermarkStamp: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        right: '40px',
        bottom: '40px',
        width: '130px',
        height: '130px',
        borderRadius: '50%',
        border: '3.5px solid rgba(185, 34, 32, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        transform: 'rotate(-11deg)',
        color: 'rgba(185, 34, 32, 0.65)',
        fontFamily: 'Oswald, sans-serif',
        fontWeight: 700,
        letterSpacing: '0.08em',
        fontSize: '13px',
        lineHeight: 1.25,
        textTransform: 'uppercase',
        pointerEvents: 'none',
        mixBlendMode: 'multiply',
        boxShadow: 'inset 0 0 0 6px rgba(185, 34, 32, 0.15)',
        zIndex: 35
      }}
    >
      <span style={{ padding: '0 10px' }}>VOX STUDIO · CASE FILE ARCHIVE</span>
    </div>
  );
};
