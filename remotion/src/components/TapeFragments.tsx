import React from 'react';

export const TapeFragments: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20
      }}
    >
      {/* Top-Left Masking Tape Fragment */}
      <div
        style={{
          position: 'absolute',
          top: '30px',
          left: '40px',
          width: '160px',
          height: '42px',
          backgroundColor: 'rgba(215, 199, 156, 0.75)',
          border: '1px solid rgba(114, 108, 94, 0.4)',
          transform: 'rotate(-18deg)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)'
        }}
      />

      {/* Top-Right Masking Tape Fragment */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          right: '50px',
          width: '180px',
          height: '46px',
          backgroundColor: 'rgba(215, 199, 156, 0.75)',
          border: '1px solid rgba(114, 108, 94, 0.4)',
          transform: 'rotate(14deg)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          clipPath: 'polygon(4% 0%, 96% 0%, 100% 50%, 96% 100%, 4% 100%, 0% 50%)'
        }}
      />

      {/* Bottom-Right Masking Tape Fragment */}
      <div
        style={{
          position: 'absolute',
          bottom: '50px',
          right: '60px',
          width: '150px',
          height: '40px',
          backgroundColor: 'rgba(215, 199, 156, 0.75)',
          border: '1px solid rgba(114, 108, 94, 0.4)',
          transform: 'rotate(-8deg)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)'
        }}
      />
    </div>
  );
};
