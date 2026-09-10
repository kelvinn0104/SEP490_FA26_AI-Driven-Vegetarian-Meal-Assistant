import React from 'react';

export default function Button({ children, onClick, variant = 'primary', disabled = false, style = {} }) {
  const baseStyle = {
    padding: '0.65rem 1.25rem',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    ...style
  };

  const variants = {
    primary: { background: '#059669', color: 'white' },
    secondary: { background: '#e2e8f0', color: '#0f172a' },
    danger: { background: '#ef4444', color: 'white' }
  };

  return (
    <button onClick={onClick} disabled={disabled} style={{ ...baseStyle, ...variants[variant] }}>
      {children}
    </button>
  );
}
