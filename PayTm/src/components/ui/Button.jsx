import React from 'react';

export default function Button({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}
