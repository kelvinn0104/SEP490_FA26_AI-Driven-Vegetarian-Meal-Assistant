import React, { useState, useEffect } from 'react';
import { getAuthToken, getStoredUser, authApi } from './api';
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

  // Helper kiểm tra quyền Admin/Mod động không phụ thuộc stale closure
  const checkAdminAccess = (targetUser) => {
    const u = targetUser || authUser || getStoredUser();
    const token = getAuthToken();
    if (!u || !token) return { isAuthed: false, isAdmin: false, isMod: false, role: 'user' };
    const r = (u.role || '').toLowerCase();
    const isAdmin = r === 'admin';
    const isMod = r === 'moderator' || r === 'mod';
    return { isAuthed: true, isAdmin, isMod, role: isAdmin ? 'admin' : (isMod ? 'mod' : 'user') };
  };

  // Mặc định khi truy cập trang web luôn là Trang chủ (HomePage) hoặc Dashboard nếu là Admin/Mod
  const [currentScreen, setCurrentScreen] = useState(() => {
    let path = window.location.pathname.replace('/', '');
    if (path === 'admin' || path === 'mod') path = 'dashboard';
    if (path === 'moderation') path = 'content-moderation';

    const { isAuthed, isAdmin, isMod } = checkAdminAccess();

    // Mở tab mới tại '/' khi Admin/Mod vẫn còn phiên đăng nhập -> vào Dashboard
    if ((path === '' || path === 'home') && isAuthed && (isAdmin || isMod)) {
      window.history.replaceState({}, '', '/dashboard');
      return 'dashboard';
    }
    if (path === 'login' && isAuthed) {
      return (isAdmin || isMod) ? 'dashboard' : 'home';
    }
    if (adminScreens.includes(path)) {
      return isAuthed && (isAdmin || isMod) ? path : 'login';
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
      let path = window.location.pathname.replace('/', '');
      if (path === 'admin' || path === 'mod') path = 'dashboard';
      if (path === 'moderation') path = 'content-moderation';

      const { isAuthed, isAdmin, isMod } = checkAdminAccess();

      if ((path === '' || path === 'home') && isAuthed && (isAdmin || isMod)) {
        window.history.replaceState({}, '', '/dashboard');
        setCurrentScreen('dashboard');
      } else if (path === 'login' && isAuthed) {
        setCurrentScreen((isAdmin || isMod) ? 'dashboard' : 'home');
      } else if (adminScreens.includes(path)) {
        if (isAuthed && (isAdmin || isMod)) {
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
  }, [authUser]);

  // Trường hợp authUser được khôi phục bất đồng bộ (refresh token/getMe) sau lần render đầu
  useEffect(() => {
    const path = window.location.pathname.replace('/', '');
    if ((userRole === 'admin' || userRole === 'mod') && currentScreen === 'home' && (path === '' || path === 'home')) {
      window.history.replaceState({}, '', '/dashboard');
      setCurrentScreen('dashboard');
    }
  }, [userRole]);

  const handleNavigate = (screen, data = null, overrideUser = null) => {
    let target = screen;
    // Map screen aliases
    if (target === 'admin' || target === 'mod') target = 'dashboard';
    if (target === 'moderation') target = 'content-moderation';

    if (target === 'article-detail' && data) {
      setSelectedArticleData(data);
    }
    if (target === 'video-detail' && data) {
      setSelectedVideoData(data);
    }

    const { isAuthed, isAdmin, isMod, role } = checkAdminAccess(overrideUser);

    // Bảo vệ các màn hình Admin/Mod: nếu chưa đăng nhập thì chuyển hướng sang trang Đăng nhập chung
    if (adminScreens.includes(target)) {
      if (!isAuthed || (!isAdmin && !isMod)) {
        setCurrentScreen('login');
        window.history.pushState({}, '', '/login');
        window.scrollTo(0, 0);
        return;
      }
      // Mod không truy cập được màn hình của Admin
      if (isMod && ['user-management', 'ai-model-monitoring', 'role-management'].includes(target)) {
        setCurrentScreen('dashboard');
        window.history.pushState({}, '', '/dashboard');
        window.scrollTo(0, 0);
        return;
      }
      // Admin không truy cập được màn hình của Mod
      if (isAdmin && ['category-management', 'content-moderation', 'recipe-management'].includes(target)) {
        setCurrentScreen('dashboard');
        window.history.pushState({}, '', '/dashboard');
        window.scrollTo(0, 0);
        return;
      }
    }

    // Nếu đã đăng nhập mà bấm vào login -> chuyển về dashboard hoặc home
    if (target === 'login' && isAuthed) {
      const dest = (isAdmin || isMod) ? 'dashboard' : 'home';
      setCurrentScreen(dest);
      window.history.pushState({}, '', dest === 'home' ? '/' : `/${dest}`);
      window.scrollTo(0, 0);
      return;
    }

    setCurrentScreen(target);
    const newPath = target === 'home' ? '/' : `/${target}`;
    window.history.pushState({}, '', newPath);
    window.scrollTo(0, 0);
  };

  const handleLogin = (role, user) => {
    authLogin(user);
    const normalizedRole = (role || user?.role || '').toLowerCase();
    const effectiveRole = normalizedRole === 'admin' ? 'admin' : (normalizedRole === 'moderator' || normalizedRole === 'mod' ? 'mod' : 'user');

    if (effectiveRole === 'admin' || effectiveRole === 'mod') {
      handleNavigate('dashboard', null, user);
    } else {
      handleNavigate('home', null, user);
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
            onNavigate={handleNavigate}
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
