import React from 'react';
import { Utensils, Camera, Bot, Users, ShieldCheck, Clock } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'planner', label: 'AI Meal Planner', icon: <Utensils size={18} /> },
    { id: 'vision', label: 'Quét Nguyên liệu (Vision)', icon: <Camera size={18} /> },
    { id: 'chatbot', label: 'AI Nutrition Chatbot', icon: <Bot size={18} /> },
    { id: 'community', label: 'Cộng đồng & Bản đồ', icon: <Users size={18} /> },
    { id: 'admin', label: 'Admin Dashboard', icon: <ShieldCheck size={18} /> },
    { id: 'moderation', label: 'Duyệt bài (Mod)', icon: <Clock size={18} /> }
  ];

  return (
    <aside className="sidebar">
      <div className="logo-section">
        <span>🥦</span> VeggieAI
      </div>

      <nav className="nav-menu">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
