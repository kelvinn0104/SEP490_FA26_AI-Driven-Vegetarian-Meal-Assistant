import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header style={{
      display: 'flex',
      justify: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #e2e8f0'
    }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', color: '#0f172a' }}>VeggieAI Portal</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Hệ sinh thái Trí tuệ Nhân tạo & Cố vấn Dinh dưỡng Thuần chay</p>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, color: '#0f172a' }}>{user.name}</div>
            <div style={{ fontSize: '0.8rem', color: '#059669' }}>{user.role}</div>
          </div>
          <button 
            onClick={logout}
            style={{ padding: '0.5rem', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#64748b' }}>
            <LogOut size={18} />
          </button>
        </div>
      )}
    </header>
  );
}
