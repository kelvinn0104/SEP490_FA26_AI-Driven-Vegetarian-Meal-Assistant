import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import MealPlannerPage from './pages/MealPlannerPage';
import VisionPage from './pages/VisionPage';
import ChatbotPage from './pages/ChatbotPage';
import CommunityPage from './pages/CommunityPage';
import AdminDashboard from './pages/AdminDashboard';
import ModerationQueue from './pages/ModerationQueue';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="app-container-full">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content-full">
        {activeTab === 'home' && <HomePage onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'planner' && <MealPlannerPage />}
        {activeTab === 'vision' && <VisionPage />}
        {activeTab === 'chatbot' && <ChatbotPage />}
        {activeTab === 'community' && <CommunityPage />}
        {activeTab === 'admin' && <AdminDashboard />}
        {activeTab === 'moderation' && <ModerationQueue />}
      </main>

      <Footer />
    </div>
  );
}
