'use client';

import React from 'react';

export function DraftWatermark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden select-none opacity-[0.05] sm:opacity-[0.07] mix-blend-difference"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='180'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' transform='rotate(-25, 180, 90)' fill='%23ffffff' font-family='sans-serif' font-size='11' font-weight='900' letter-spacing='2'>CONFIDENTIAL DRAFT • REVIEW ONLY</text></svg>")`,
        backgroundRepeat: 'repeat',
      }}
    />
  );
}
