import React from 'react';

export default function GlassLoader({ size = 48, className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden>
      <div
        className="rounded-full border-2 border-white/10 bg-white/5 p-2 backdrop-blur"
        style={{ width: size, height: size }}
      >
        <div className="h-full w-full animate-spin rounded-full border-4 border-current border-r-transparent" />
      </div>
    </div>
  );
}
