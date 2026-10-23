import React, { useState, useEffect } from 'react';
import { getAuthToken, authApi } from './api';
import { useAuth } from './context/AuthContext.jsx';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Navbar, Footer } from './components/layout';
import { SearchModal } from './components/ui/SearchModal';
import { AgentModal } from './components/ui/AgentModal';
import { DocModal } from './components/ui/DocModal';
import { Card, Button } from './components/ui';
import { Sparkles, Camera } from 'lucide-react';

// Admin & Mod screens
import { DashboardScreen } from './pages/DashboardScreen';
import {
  UserManagementScreen,
  AiMonitoringScreen,
  RoleManagementScreen,
} from './pages/admin';
import {
  CategoryManagementScreen,
  ContentModerationScreen,
  RecipeManagementScreen,
} from './pages/mod';

// User pages
import {
  HomePage,
  LoginPage,
  RegisterPage,
  MealPlannerPage,
  CreateMealPlanPage,
  MealHistoryPage,
  VisionPage,
  ChatbotPage,
  CommunityPage,
  BlogPage,
  VideosPage,
  ArticleDetailPage,
  VideoDetailPage,
  HealthProfilePage,
  NutritionDashboardPage,
  MyCollectionPage,
  ManagePostsPage,
  UserAccountPage,
  CreatePostPage,
  CreateVideoPage,
} from './pages/user';

const adminScreens = [
  'dashboard',
  'user-management',
  'category-management',
  'content-moderation',
  'recipe-management',
  'ai-model-monitoring',
  'role-management',
];

const userScreens = [
  'home',
  'login',
  'register',
  'planner',
  'create-plan',
  'create-mealplan',
  'meal-history',
  'vision',
  'chatbot',
  'community',
  'blog',
  'videos',
  'article-detail',
  'video-detail',
  'user-profile',
  'user-nutrition',
  'user-collection',
  'user-posts',
  'user-settings',
  'create-post',
  'create-video',
];

export default function App() {
  const { user: authUser, login: authLogin, logout: authLogout } = useAuth();

  const isAuthenticated = !!authUser;
  const currentUser = authUser;
  const userRole = (() => {
    const role = (authUser?.role || '').toLowerCase();
    if (role === 'admin') return 'admin';
    if (role === 'moderator' || role === 'mod') return 'mod';
    return 'user';
  })();

  // Mặc định khi truy cập trang web luôn là Trang chủ (HomePage)
  const [currentScreen, setCurrentScreen] = useState(() => {
    const path = window.location.pathname.replace('/', '');
    if (adminScreens.includes(path) && authUser) {
      return path;
    }
    if (userScreens.includes(path)) {
      return path;
    }
    return 'home';
  });

  const [selectedArticleData, setSelectedArticleData] = useState(null);
  const [selectedVideoData, setSelectedVideoData] = useState(null);
  const [pendingCount, setPendingCount] = useState(14);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '');
      if (adminScreens.includes(path)) {
        if (isAuthenticated) {
          setCurrentScreen(path);
        } else {
          setCurrentScreen('login');
        }
      } else if (userScreens.includes(path)) {
        setCurrentScreen(path);
      } else {
        setCurrentScreen('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isAuthenticated]);

  const handleNavigate = (screen, data = null) => {
    if (screen === 'article-detail' && data) {
      setSelectedArticleData(data);
    }
    if (screen === 'video-detail' && data) {
      setSelectedVideoData(data);
    }

    // Bảo vệ các màn hình Admin/Mod: nếu chưa đăng nhập thì chuyển hướng sang trang Đăng nhập chung
    if (adminScreens.includes(screen)) {
      if (!isAuthenticated || (userRole !== 'admin' && userRole !== 'mod')) {
        setCurrentScreen('login');
        window.history.pushState({}, '', '/login');
        window.scrollTo(0, 0);
        return;
      }
      // Mod không truy cập được màn hình của Admin
      if (userRole === 'mod' && ['user-management', 'ai-model-monitoring', 'role-management'].includes(screen)) {
        setCurrentScreen('dashboard');
        window.history.pushState({}, '', '/dashboard');
        window.scrollTo(0, 0);
        return;
      }
      // Admin không truy cập được màn hình của Mod
      if (userRole === 'admin' && ['category-management', 'content-moderation', 'recipe-management'].includes(screen)) {
        setCurrentScreen('dashboard');
        window.history.pushState({}, '', '/dashboard');
        window.scrollTo(0, 0);
        return;
      }
    }

    setCurrentScreen(screen);
    const newPath = screen === 'home' ? '/' : `/${screen}`;
    window.history.pushState({}, '', newPath);
    window.scrollTo(0, 0);
  };

  const handleLogin = (role, user) => {
    authLogin(user);
    const normalizedRole = (role || user?.role || '').toLowerCase();
    const effectiveRole = normalizedRole === 'admin' ? 'admin' : (normalizedRole === 'moderator' || normalizedRole === 'mod' ? 'mod' : 'user');

    if (effectiveRole === 'admin') {
      handleNavigate('dashboard');
    } else if (effectiveRole === 'mod') {
      handleNavigate('dashboard');
    } else {
      handleNavigate('home');
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch { }
    authLogout();
    handleNavigate('home');
  };

  const handleToggleRole = () => {
    const nextRole = userRole === 'admin' ? 'mod' : 'admin';
    const updatedUser = {
      ...authUser,
      role: nextRole === 'admin' ? 'Admin' : 'Moderator',
      roleLabel: nextRole === 'admin' ? 'Admin' : 'Moderator'
    };
    authLogin(updatedUser);
    if (nextRole === 'mod' && ['user-management', 'ai-model-monitoring', 'role-management'].includes(currentScreen)) {
      handleNavigate('category-management');
    } else if (nextRole === 'admin' && ['category-management', 'content-moderation', 'recipe-management'].includes(currentScreen)) {
      handleNavigate('dashboard');
    }
  };

  const isAdminView = adminScreens.includes(currentScreen) && isAuthenticated && (userRole === 'admin' || userRole === 'mod');

  // NẾU LÀ GIAO DIỆN QUẢN TRỊ (ADMIN/MOD)
  if (isAdminView) {
    return (
      <div className="min-h-screen bg-background text-on-surface antialiased flex flex-col font-sans select-none sm:select-auto">
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          userRole={userRole}
          pendingCount={pendingCount}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenDocModal={() => setIsDocModalOpen(true)}
          onToggleRole={handleToggleRole}
        />

        <div className="pl-0 lg:pl-[260px] flex-1 flex flex-col transition-all">
          <Header
            currentScreen={currentScreen}
            userRole={userRole}
            currentUser={currentUser || { name: 'Admin', email: 'admin@veggie.vn' }}
            onLogout={handleLogout}
            onToggleRole={handleToggleRole}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenAgentModal={() => setIsAgentModalOpen(true)}
            onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          />

          <main className="relative pt-20 px-space-md lg:px-space-lg pb-space-2xl w-full max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)]">
            {currentScreen === 'dashboard' && (
              <DashboardScreen
                onNavigate={handleNavigate}
                onOpenAgentModal={() => setIsAgentModalOpen(true)}
                pendingCount={pendingCount}
                userRole={userRole}
              />
            )}

            {currentScreen === 'user-management' && <UserManagementScreen />}

            {currentScreen === 'category-management' && <CategoryManagementScreen />}

            {currentScreen === 'content-moderation' && (
              <ContentModerationScreen
                onUpdatePendingCount={(count) => setPendingCount(count)}
              />
            )}

            {currentScreen === 'recipe-management' && <RecipeManagementScreen />}

            {currentScreen === 'ai-model-monitoring' && <AiMonitoringScreen />}

            {currentScreen === 'role-management' && <RoleManagementScreen />}
          </main>
        </div>

        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={handleNavigate}
          userRole={userRole}
        />

        <AgentModal
          isOpen={isAgentModalOpen}
          onClose={() => setIsAgentModalOpen(false)}
        />

        <DocModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
        />
      </div>
    );
  }

  // GIAO DIỆN NGƯỜI DÙNG (CÓ NAVBAR TRÊN & FOOTER DƯỚI)
  return (
    <div className="user-app-layout flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Navbar
        activeTab={currentScreen}
        setActiveTab={handleNavigate}
        onNavigate={handleNavigate}
      />

      <main className="flex-1 w-full">
        {currentScreen === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentScreen === 'login' && <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />}
        {currentScreen === 'register' && <RegisterPage onNavigate={handleNavigate} />}

        {/* THỰC ĐƠN TUẦN AI */}
        {currentScreen === 'planner' && (
          <MealPlannerPage onNavigate={handleNavigate} />
        )}

        {(currentScreen === 'create-plan' || currentScreen === 'create-mealplan') && (
          <CreateMealPlanPage onNavigate={handleNavigate} />
        )}

        {currentScreen === 'meal-history' && (
          <MealHistoryPage onNavigate={handleNavigate} />
        )}

        {/* QUÉT TỦ LẠNH VISION */}
        {currentScreen === 'vision' && (
          <VisionPage onNavigate={handleNavigate} />
        )}

        {currentScreen === 'chatbot' && <ChatbotPage onNavigate={handleNavigate} />}
        {currentScreen === 'community' && <CommunityPage onNavigate={handleNavigate} />}
        {currentScreen === 'blog' && <BlogPage onNavigate={handleNavigate} />}
        {currentScreen === 'videos' && <VideosPage onNavigate={handleNavigate} />}

        {currentScreen === 'article-detail' && (
          <ArticleDetailPage articleData={selectedArticleData} onNavigate={handleNavigate} />
        )}
        {currentScreen === 'video-detail' && (
          <VideoDetailPage videoData={selectedVideoData} onNavigate={handleNavigate} />
        )}

        {currentScreen === 'user-profile' && <HealthProfilePage onNavigate={handleNavigate} />}
        {currentScreen === 'user-nutrition' && <NutritionDashboardPage onNavigate={handleNavigate} />}
        {(currentScreen === 'user-collection' || currentScreen === 'collection') && (
          <MyCollectionPage onNavigate={handleNavigate} />
        )}
        {(currentScreen === 'user-posts' || currentScreen === 'manage-posts') && (
          <ManagePostsPage onNavigate={handleNavigate} />
        )}
        {currentScreen === 'user-settings' && <UserAccountPage onNavigate={handleNavigate} />}
        {currentScreen === 'create-post' && <CreatePostPage onNavigate={handleNavigate} />}
        {currentScreen === 'create-video' && <CreateVideoPage onNavigate={handleNavigate} />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
