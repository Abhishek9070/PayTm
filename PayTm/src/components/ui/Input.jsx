import React from 'react';

export default function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:bg-slate-700/80 focus:ring-1 focus:ring-sky-400/30 ${className}`}
    />
  );
}
