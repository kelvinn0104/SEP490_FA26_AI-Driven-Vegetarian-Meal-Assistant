import React, { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MealPlannerPage from './pages/MealPlannerPage';
import VisionPage from './pages/VisionPage';
import ChatbotPage from './pages/ChatbotPage';
import CommunityPage from './pages/CommunityPage';
import AdminDashboard from './pages/AdminDashboard';
import ModerationQueue from './pages/ModerationQueue';

export default function App() {
  const [activeTab, setActiveTab] = useState('planner');

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content">
        <Header />

        {activeTab === 'planner' && <MealPlannerPage />}
        {activeTab === 'vision' && <VisionPage />}
        {activeTab === 'chatbot' && <ChatbotPage />}
        {activeTab === 'community' && <CommunityPage />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'moderation' && <ModerationQueue />}
      </main>
    </div>
  );
}
