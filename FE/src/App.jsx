import React, { useState, useEffect } from "react";
import { PortalBoundary } from "./user/PortalBoundary";
import { getAuthToken, getStoredUser, authApi } from "./api";
import { useAuth } from "./context/AuthContext.jsx";
const AdminView = React.lazy(() => import("./AdminView.jsx"));
const UserPortal = React.lazy(() => import("./user/UserPortal.jsx"));

const adminScreens = [
  "dashboard",
  "user-management",
  "category-management",
  "ingredient-management",
  "content-moderation",
  "recipe-management",
  "challenge-management",
  "ai-model-monitoring",
  "role-management",
  "feedback-management",
  "nutrition-analytics",
  "broadcast-notification",
  "reward-management",
];

const userScreens = [
  "me",
  "welcome",
  "home",
  "discover",
  "notifications",
  "login",
  "register",
  "planner",
  "create-plan",
  "create-mealplan",
  "meal-history",
  "chatbot",
  "community",
  "post-detail",
  "blog",
  "videos",
  "article-detail",
  "video-detail",
  "user-profile",
  "user-nutrition",
  "user-collection",
  "user-posts",
  "user-settings",
  "create-post",
  "create-video",
];

export default function App() {
  const { user: authUser, login: authLogin, logout: authLogout } = useAuth();

  const isAuthenticated = !!authUser;
  const currentUser = authUser;
  const userRole = (() => {
    const role = (authUser?.role || "").toLowerCase();
    if (role === "admin") return "admin";
    if (role === "moderator" || role === "mod") return "mod";
    return "user";
  })();

  // Helper kiểm tra quyền Admin/Mod động không phụ thuộc stale closure
  const checkAdminAccess = (targetUser) => {
    const u = targetUser || authUser || getStoredUser();
    const token = getAuthToken();
    if (!u || !token)
      return { isAuthed: false, isAdmin: false, isMod: false, role: "user" };
    const r = (u.role || "").toLowerCase();
    const isAdmin = r === "admin";
    const isMod = r === "moderator" || r === "mod";
    return {
      isAuthed: true,
      isAdmin,
      isMod,
      role: isAdmin ? "admin" : isMod ? "mod" : "user",
    };
  };

  // Mặc định khi truy cập trang web luôn là Trang chủ (HomePage) hoặc Dashboard nếu là Admin/Mod
  const [currentScreen, setCurrentScreen] = useState(() => {
    let path = window.location.pathname.replace("/", "");
    if (path === "vision") {
      window.history.replaceState({}, "", "/discover");
      path = "discover";
    }
    if (path === "admin" || path === "mod") path = "dashboard";
    if (path === "moderation") path = "content-moderation";

    const { isAuthed, isAdmin, isMod } = checkAdminAccess();

    // Mở tab mới tại '/' khi Admin/Mod vẫn còn phiên đăng nhập -> vào Dashboard
    if ((path === "" || path === "home") && isAuthed && (isAdmin || isMod)) {
      window.history.replaceState({}, "", "/dashboard");
      return "dashboard";
    }
    if (path === "login" && isAuthed) {
      return isAdmin || isMod ? "dashboard" : "home";
    }
    if (adminScreens.includes(path)) {
      return isAuthed && (isAdmin || isMod) ? path : "login";
    }
    if (userScreens.includes(path)) {
      return path;
    }
    return "home";
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
      let path = window.location.pathname.replace("/", "");
      if (path === "vision") {
        window.history.replaceState({}, "", "/discover");
        path = "discover";
      }
      if (path === "admin" || path === "mod") path = "dashboard";
      if (path === "moderation") path = "content-moderation";

      const { isAuthed, isAdmin, isMod } = checkAdminAccess();

      if ((path === "" || path === "home") && isAuthed && (isAdmin || isMod)) {
        window.history.replaceState({}, "", "/dashboard");
        setCurrentScreen("dashboard");
      } else if (path === "login" && isAuthed) {
        setCurrentScreen(isAdmin || isMod ? "dashboard" : "home");
      } else if (adminScreens.includes(path)) {
        if (isAuthed && (isAdmin || isMod)) {
          setCurrentScreen(path);
        } else {
          setCurrentScreen("login");
        }
      } else if (userScreens.includes(path)) {
        setCurrentScreen(path);
      } else {
        setCurrentScreen("home");
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [authUser]);

  // Trường hợp authUser được khôi phục bất đồng bộ (refresh token/getMe) sau lần render đầu
  useEffect(() => {
    const path = window.location.pathname.replace("/", "");
    if (
      (userRole === "admin" || userRole === "mod") &&
      currentScreen === "home" &&
      (path === "" || path === "home")
    ) {
      window.history.replaceState({}, "", "/dashboard");
      setCurrentScreen("dashboard");
    }
  }, [userRole]);

  const handleNavigate = (screen, data = null, overrideUser = null) => {
    let target = screen;
    // Map screen aliases
    if (target === "admin" || target === "mod") target = "dashboard";
    if (target === "moderation") target = "content-moderation";

    if (target === "article-detail" && data) {
      setSelectedArticleData(data);
    }
    if (target === "video-detail" && data) {
      setSelectedVideoData(data);
    }

    const { isAuthed, isAdmin, isMod, role } = checkAdminAccess(overrideUser);

    // Bảo vệ các màn hình Admin/Mod: nếu chưa đăng nhập thì chuyển hướng sang trang Đăng nhập chung
    if (adminScreens.includes(target)) {
      if (!isAuthed || (!isAdmin && !isMod)) {
        setCurrentScreen("login");
        window.history.pushState({}, "", "/login");
        window.scrollTo(0, 0);
        return;
      }
      // Mod không truy cập được màn hình của Admin
      if (
        isMod &&
        ["user-management", "ai-model-monitoring", "role-management"].includes(
          target,
        )
      ) {
        setCurrentScreen("dashboard");
        window.history.pushState({}, "", "/dashboard");
        window.scrollTo(0, 0);
        return;
      }
      // Admin không truy cập được màn hình của Mod
      if (
        isAdmin &&
        [
          "category-management",
          "ingredient-management",
          "content-moderation",
          "recipe-management",
          "challenge-management",
        ].includes(target)
      ) {
        setCurrentScreen("dashboard");
        window.history.pushState({}, "", "/dashboard");
        window.scrollTo(0, 0);
        return;
      }
    }

    // Nếu đã đăng nhập mà bấm vào login -> chuyển về dashboard hoặc home
    if (target === "login" && isAuthed) {
      const dest = isAdmin || isMod ? "dashboard" : "home";
      setCurrentScreen(dest);
      window.history.pushState({}, "", dest === "home" ? "/" : `/${dest}`);
      window.scrollTo(0, 0);
      return;
    }

    setCurrentScreen(target);
    const newPath = target === "home" ? "/" : `/${target}`;
    window.history.pushState({}, "", newPath);
    window.scrollTo(0, 0);
  };

  const handleLogin = (role, user) => {
    authLogin(user);
    const normalizedRole = (role || user?.role || "").toLowerCase();
    const effectiveRole =
      normalizedRole === "admin"
        ? "admin"
        : normalizedRole === "moderator" || normalizedRole === "mod"
          ? "mod"
          : "user";

    if (effectiveRole === "admin" || effectiveRole === "mod") {
      handleNavigate("dashboard", null, user);
    } else {
      handleNavigate("home", null, user);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    authLogout();
    handleNavigate("home");
  };

  const handleToggleRole = () => {
    const nextRole = userRole === "admin" ? "mod" : "admin";
    const updatedUser = {
      ...authUser,
      role: nextRole === "admin" ? "Admin" : "Moderator",
      roleLabel: nextRole === "admin" ? "Admin" : "Moderator",
    };
    authLogin(updatedUser);
    if (
      nextRole === "mod" &&
      ["user-management", "ai-model-monitoring", "role-management"].includes(
        currentScreen,
      )
    ) {
      handleNavigate("category-management");
    } else if (
      nextRole === "admin" &&
      [
        "category-management",
        "ingredient-management",
        "content-moderation",
        "recipe-management",
        "challenge-management",
      ].includes(currentScreen)
    ) {
      handleNavigate("dashboard");
    }
  };

  const isAdminView =
    adminScreens.includes(currentScreen) &&
    isAuthenticated &&
    (userRole === "admin" || userRole === "mod");

  // NẾU LÀ GIAO DIỆN QUẢN TRỊ (ADMIN/MOD)
  if (isAdminView) {
    return (
      <React.Suspense
        fallback={
          <div role="status" style={{ padding: 40 }}>
            Đang tải giao diện quản trị…
          </div>
        }
      >
        <AdminView
          currentScreen={currentScreen}
          handleNavigate={handleNavigate}
          userRole={userRole}
          pendingCount={pendingCount}
          isMobileSidebarOpen={isMobileSidebarOpen}
          setIsMobileSidebarOpen={setIsMobileSidebarOpen}
          setIsDocModalOpen={setIsDocModalOpen}
          handleToggleRole={handleToggleRole}
          currentUser={currentUser}
          handleLogout={handleLogout}
          setIsSearchOpen={setIsSearchOpen}
          setIsAgentModalOpen={setIsAgentModalOpen}
          setPendingCount={setPendingCount}
          isSearchOpen={isSearchOpen}
          isAgentModalOpen={isAgentModalOpen}
          isDocModalOpen={isDocModalOpen}
        />
      </React.Suspense>
    );
  }

  return (
    <PortalBoundary>
      <React.Suspense
        fallback={
          <div role="status" style={{ padding: 40 }}>
            Đang tải VeggieAI…
          </div>
        }
      >
        <UserPortal
          screen={currentScreen}
          onNavigate={handleNavigate}
          onLogin={handleLogin}
        />
      </React.Suspense>
    </PortalBoundary>
  );
}
