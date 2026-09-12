import React, { useState } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MealPlannerPage from './pages/MealPlannerPage';
import VisionPage from './pages/VisionPage';
import ChatbotPage from './pages/ChatbotPage';
import CommunityPage from './pages/CommunityPage';
import BlogPage from './pages/BlogPage';
import VideosPage from './pages/VideosPage';
import AdminDashboard from './pages/AdminDashboard';
import ModerationQueue from './pages/ModerationQueue';
import { useAuth } from './context/AuthContext';
import { ShieldAlert, LogIn, Lock, Sparkles, Camera } from 'lucide-react';
import Button from './components/ui/Button';
import Card from './components/ui/Card';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { user, loginAsAdmin } = useAuth();

  return (
    <div className="app-container-full">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="main-content-full">
        {activeTab === 'home' && <HomePage onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'login' && <LoginPage onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'register' && <RegisterPage onNavigate={(tab) => setActiveTab(tab)} />}
        
        {/* BẢO VỆ CHỨC NĂNG THỰC ĐƠN AI: YÊU CẦU HOÀN TẤT ĐĂNG KÝ / HỒ SƠ DINH DƯỠNG */}
        {activeTab === 'planner' && (
          user ? (
            <MealPlannerPage />
          ) : (
            <Card style={{ maxWidth: '620px', margin: '3rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ width: '64px', height: '64px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <Sparkles size={32} color="#059669" />
              </div>
              <h2 style={{ color: '#0f172a', marginBottom: '0.75rem' }}>Yêu Cầu Thiết Lập Hồ Sơ Dinh Dưỡng</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Tính năng Lập Thực Đơn AI 7 ngày được cá nhân hóa tự động theo thể trạng và nhu cầu dinh dưỡng. Khách vãng lai cần hoàn tất đăng ký để khởi tạo thực đơn riêng.
              </p>
              <Button variant="primary" onClick={() => setActiveTab('register')}>
                🚀 Bắt đầu quy trình đăng ký & khảo sát dinh dưỡng
              </Button>
            </Card>
          )
        )}

        {/* BẢO VỆ CHỨC NĂNG QUÉT TỦ LẠNH: YÊU CẦU ĐĂNG KÝ */}
        {activeTab === 'vision' && (
          user ? (
            <VisionPage />
          ) : (
            <Card style={{ maxWidth: '620px', margin: '3rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ width: '64px', height: '64px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <Camera size={32} color="#059669" />
              </div>
              <h2 style={{ color: '#0f172a', marginBottom: '0.75rem' }}>Yêu Cầu Đăng Ký Tài Khoản</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Tính năng Nhận diện nguyên liệu tủ lạnh & đánh giá độ tươi bằng Computer Vision (YOLO) chỉ dành riêng cho thành viên đã đăng nhập.
              </p>
              <Button variant="primary" onClick={() => setActiveTab('register')}>
                🚀 Bắt đầu quy trình đăng ký tài khoản
              </Button>
            </Card>
          )
        )}

        {activeTab === 'chatbot' && <ChatbotPage onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'blog' && <BlogPage onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'videos' && <VideosPage onNavigate={(tab) => setActiveTab(tab)} />}
        {activeTab === 'community' && <CommunityPage />}

        {/* BẢO VỆ TRANG ADMIN: Chỉ cho phép truy cập khi ĐÃ ĐĂNG NHẬP với quyền ADMIN */}
        {activeTab === 'admin' && (
          user && user.role === 'Admin' ? (
            <AdminDashboard />
          ) : (
            <Card style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ width: '60px', height: '60px', background: '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <Lock size={30} color="#ef4444" />
              </div>
              <h2 style={{ color: '#0f172a', marginBottom: '0.75rem' }}>Yêu Cầu Quyền Quản Trị Viên</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Bạn chưa đăng nhập hoặc tài khoản không có quyền Admin. Trang này chỉ dành riêng cho Quản trị viên hệ thống quản lý dữ liệu và AI.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="primary" onClick={() => setActiveTab('login')}>
                  <LogIn size={18} /> Đăng nhập / Đăng ký
                </Button>
                <Button variant="secondary" onClick={() => { loginAsAdmin(); }}>
                  Thử nghiệm quyền Admin (Demo)
                </Button>
              </div>
            </Card>
          )
        )}

        {/* BẢO VỆ TRANG MODERATION: Chỉ cho phép truy cập khi ĐÃ ĐĂNG NHẬP */}
        {activeTab === 'moderation' && (
          user && (user.role === 'Admin' || user.role === 'Moderator') ? (
            <ModerationQueue />
          ) : (
            <Card style={{ maxWidth: '600px', margin: '3rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ width: '60px', height: '60px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <ShieldAlert size={30} color="#d97706" />
              </div>
              <h2 style={{ color: '#0f172a', marginBottom: '0.75rem' }}>Yêu Cầu Quyền Kiểm Duyệt (Mod)</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
                Trang này dành cho Moderator phê duyệt các bài viết blog & video nấu chay của cộng đồng.
              </p>
              <Button variant="primary" onClick={() => setActiveTab('login')}>
                <LogIn size={18} /> Đăng nhập
              </Button>
            </Card>
          )
        )}
      </main>

      <Footer onNavigate={(tab) => setActiveTab(tab)} />
    </div>
  );
}
