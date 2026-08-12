import React from 'react';

export const PaperBackground: React.FC = () => {
  return (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: '#EAE1C8',
        background: `
          radial-gradient(ellipse at 20% -10%, rgba(255,255,255,0.4), transparent 40%),
          repeating-linear-gradient(115deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 3px),
          #EAE1C8
        `,
        overflow: 'hidden'
      }}
    >
      {/* Archival Map Grid Lines */}
      <svg width="1920" height="1080" style={{ position: 'absolute', opacity: 0.18 }}>
        <defs>
          <pattern id="paperGrid" width="90" height="90" patternUnits="userSpaceOnUse">
            <path d="M 90 0 L 0 0 0 90" fill="none" stroke="#221D14" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#paperGrid)" />
      </svg>
    </div>
  );
};
