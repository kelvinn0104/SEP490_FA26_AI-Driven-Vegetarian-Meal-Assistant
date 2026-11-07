import React from "react";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { SearchModal } from "./components/ui/SearchModal";
import { AgentModal } from "./components/ui/AgentModal";
import { DocModal } from "./components/ui/DocModal";

// Admin & Mod screens
import { DashboardScreen } from "./pages/DashboardScreen";
import {
  UserManagementScreen,
  AiMonitoringScreen,
  RoleManagementScreen,
} from "./pages/admin";
import {
  CategoryManagementScreen,
  ContentModerationScreen,
  RecipeManagementScreen,
  IngredientManagementScreen,
  VeganChallengeManagementScreen,
} from "./pages/mod";
import { FeedbackManagementScreen } from "./pages/FeedbackManagementScreen";
import { NutritionAnalyticsScreen } from "./pages/NutritionAnalyticsScreen";
import { BroadcastNotificationScreen } from "./pages/BroadcastNotificationScreen";
import { RewardManagementScreen } from "./pages/RewardManagementScreen";

import "./index.css";
import "./admin-fonts.css";
export default function AdminView({
  currentScreen,
  handleNavigate,
  userRole,
  pendingCount,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  setIsDocModalOpen,
  handleToggleRole,
  currentUser,
  handleLogout,
  setIsSearchOpen,
  setIsAgentModalOpen,
  setPendingCount,
  isSearchOpen,
  isAgentModalOpen,
  isDocModalOpen,
}) {
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
          currentUser={
            currentUser || { name: "Admin", email: "admin@veggie.vn" }
          }
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          onToggleRole={handleToggleRole}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAgentModal={() => setIsAgentModalOpen(true)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        <main className="relative pt-20 px-space-md lg:px-space-lg pb-space-2xl w-full max-w-[1600px] mx-auto min-h-[calc(100vh-4rem)]">
          {currentScreen === "dashboard" && (
            <DashboardScreen
              onNavigate={handleNavigate}
              onOpenAgentModal={() => setIsAgentModalOpen(true)}
              pendingCount={pendingCount}
              userRole={userRole}
            />
          )}

          {currentScreen === "user-management" && <UserManagementScreen />}

          {currentScreen === "category-management" && (
            <CategoryManagementScreen />
          )}

          {currentScreen === "ingredient-management" && (
            <IngredientManagementScreen />
          )}

          {currentScreen === "content-moderation" && (
            <ContentModerationScreen
              onUpdatePendingCount={(count) => setPendingCount(count)}
            />
          )}

          {currentScreen === "recipe-management" && <RecipeManagementScreen />}

          {currentScreen === "challenge-management" && (
            <VeganChallengeManagementScreen />
          )}

          {currentScreen === "ai-model-monitoring" && <AiMonitoringScreen />}

          {currentScreen === "role-management" && <RoleManagementScreen />}

          {currentScreen === "feedback-management" && (
            <FeedbackManagementScreen userRole={userRole} />
          )}

          {currentScreen === "nutrition-analytics" && (
            <NutritionAnalyticsScreen userRole={userRole} />
          )}

          {currentScreen === "broadcast-notification" && (
            <BroadcastNotificationScreen />
          )}

          {currentScreen === "reward-management" && (
            <RewardManagementScreen />
          )}
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
