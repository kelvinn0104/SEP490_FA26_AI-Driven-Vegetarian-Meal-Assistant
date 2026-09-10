import React from 'react';

export default function Badge({ children, type = 'pending' }) {
  const types = {
    pending: 'badge-pending',
    success: 'badge-success',
    admin: 'badge-admin'
  };

  return (
    <span className={`badge ${types[type] || 'badge-pending'}`}>
      {children}
    </span>
  );
}
