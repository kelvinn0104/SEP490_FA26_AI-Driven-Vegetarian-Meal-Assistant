import React, { useState, useEffect } from 'react';
import { getAuthToken, getStoredUser, authApi } from './api';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SearchModal } from './components/ui/SearchModal';
import { AgentModal } from './components/ui/AgentModal';
import { DocModal } from './components/ui/DocModal';
import { DashboardScreen } from './pages/DashboardScreen';
import { AuthScreen } from './pages/AuthScreen';
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAuthToken());
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = getStoredUser();
    return stored || { name: 'Linh Nguyen', email: 'admin@veggie.vn' };
  });
  const [userRole, setUserRole] = useState(() => {
    const stored = getStoredUser();
    if (stored?.role === 'moderator' || stored?.role === 'mod') return 'mod';
    return 'admin';
  });

  const [currentScreen, setCurrentScreen] = useState(() => {
    const path = window.location.pathname.replace('/', '');
    const validScreens = [
      'dashboard',
      'user-management',
      'category-management',
      'content-moderation',
      'recipe-management',
      'ai-model-monitoring',
      'role-management',
    ];
    if (validScreens.includes(path)) {
      return path;
    }
    return 'dashboard';
  });

  const [pendingCount, setPendingCount] = useState(14);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace('/', '');
      const validScreens = [
        'dashboard',
        'user-management',
        'category-management',
        'content-moderation',
        'recipe-management',
        'ai-model-monitoring',
        'role-management',
      ];
      if (validScreens.includes(path)) {
        setCurrentScreen(path);
      } else {
        setCurrentScreen('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (screen) => {
    // Moderator Guarding: MOD cannot access admin screens
    if (userRole === 'mod' && ['user-management', 'ai-model-monitoring', 'role-management'].includes(screen)) {
      setCurrentScreen('dashboard');
      window.history.pushState({}, '', '/');
      return;
    }
    // Admin Guarding: Admin cannot access mod screens (exclusive to MOD)
    if (userRole === 'admin' && ['category-management', 'content-moderation', 'recipe-management'].includes(screen)) {
      setCurrentScreen('dashboard');
      window.history.pushState({}, '', '/');
      return;
    }
    setCurrentScreen(screen);
    const newPath = screen === 'dashboard' ? '/' : `/${screen}`;
    window.history.pushState({}, '', newPath);
  };

  const handleLogin = (role, user) => {
    setUserRole(role);
    setCurrentUser(user);
    setIsAuthenticated(true);
    // Reset to dashboard on login
    handleNavigate('dashboard');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch { }
    setIsAuthenticated(false);
  };

  const handleToggleRole = () => {
    const nextRole = userRole === 'admin' ? 'mod' : 'admin';
    setUserRole(nextRole);
    if (nextRole === 'mod' && ['user-management', 'ai-model-monitoring', 'role-management'].includes(currentScreen)) {
      setCurrentScreen('category-management');
      window.history.pushState({}, '', '/category-management');
    } else if (nextRole === 'admin' && ['category-management', 'content-moderation', 'recipe-management'].includes(currentScreen)) {
      setCurrentScreen('dashboard');
      window.history.pushState({}, '', '/');
    }
  };

  if (!isAuthenticated) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex flex-col font-sans select-none sm:select-auto">
      {/* Persistent Left Sidebar */}
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

      {/* Main Content Area */}
      <div className="pl-0 lg:pl-[260px] flex-1 flex flex-col transition-all">
        {/* Fixed Top Header */}
        <Header
          currentScreen={currentScreen}
          userRole={userRole}
          currentUser={currentUser}
          onLogout={handleLogout}
          onToggleRole={handleToggleRole}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAgentModal={() => setIsAgentModalOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Dynamic Screen View */}
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

      {/* Modals & Dialogs */}
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
