import { BottomNav, PersonalSpace, Welcome } from "./Navigation";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  lazy,
  Suspense,
} from "react";
import {
  Leaf,
  ArrowRight,
  X,
  User,
  Bell,
  MessageCircle,
  ArrowLeft,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui";
import { Discover } from "./Recipes";
import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import "./portal.css";
const RecipeDetail = lazy(() =>
  import("./RecipeDetail").then((module) => ({ default: module.RecipeDetail })),
);
const AuthForm = lazy(() =>
  import("./AuthForm").then((module) => ({ default: module.AuthForm })),
);
const Planner = lazy(() =>
  import("./Planner").then((module) => ({ default: module.Planner })),
);
const Chat = lazy(() =>
  import("./Chat").then((module) => ({ default: module.Chat })),
);
const Profile = lazy(() =>
  import("./Account").then((module) => ({ default: module.Profile })),
);
const Account = lazy(() =>
  import("./Account").then((module) => ({ default: module.Account })),
);
const Community = lazy(() =>
  import("./Community").then((module) => ({ default: module.Community })),
);
const CreatePost = lazy(() =>
  import("./PostComposer").then((module) => ({ default: module.CreatePost })),
);
const PostDetail = lazy(() =>
  import("./PostDetail").then((module) => ({ default: module.PostDetail })),
);
const Today = lazy(() =>
  import("./Today").then((module) => ({ default: module.Today })),
);
const Collection = lazy(() =>
  import("./Activity").then((module) => ({ default: module.Collection })),
);
const Nutrition = lazy(() =>
  import("./Activity").then((module) => ({ default: module.Nutrition })),
);
const Notifications = lazy(() =>
  import("./Activity").then((module) => ({ default: module.Notifications })),
);
const titles = {
  home: "Khám phá món chay",
  discover: "Khám phá món chay",
  me: "Cá nhân",
  welcome: "Chào mừng",
  login: "Đăng nhập",
  register: "Tạo tài khoản",
  "article-detail": "Công thức chay",
  blog: "Khám phá món chay",
  planner: "Thực đơn",
  "create-plan": "Tạo thực đơn",
  "meal-history": "Lịch sử thực đơn",
  chatbot: "Trò chuyện",
  community: "Cộng đồng",
  "post-detail": "Bài viết cộng đồng",
  "user-collection": "Món đã lưu",
  "user-profile": "Hồ sơ sức khỏe",
  "user-settings": "Tài khoản",
  "user-posts": "Bài viết của tôi",
  "user-nutrition": "Nhật ký dinh dưỡng",
  notifications: "Thông báo",
  "create-post": "Chia sẻ bài viết",
};
const protectedScreens = [
  "welcome",
  "planner",
  "create-plan",
  "create-mealplan",
  "meal-history",
  "chatbot",
  "user-collection",
  "user-profile",
  "user-settings",
  "user-posts",
  "user-nutrition",
  "create-post",
  "create-video",
  "notifications",
];
const guestCopy = {
  planner: [
    "Lên thực đơn, bớt nghĩ mỗi bữa.",
    "Lưu hồ sơ và chọn số ngày. Thực đơn được tạo theo nhu cầu và dị ứng của bạn.",
  ],
  chatbot: [
    "Bạn muốn hỏi gì về bữa chay?",
    "Đăng nhập để hỏi trợ lý và xem lại những cuộc trò chuyện của bạn.",
  ],
  "user-collection": [
    "Giữ lại món bạn muốn nấu.",
    "Đăng nhập để lưu công thức và mở lại trên các thiết bị của bạn.",
  ],
  "user-profile": [
    "Bắt đầu từ nhu cầu của bạn.",
    "Hồ sơ sức khỏe và dị ứng giúp điều chỉnh thực đơn. Bạn có thể cập nhật bất cứ lúc nào.",
  ],
};
export default function UserPortal({ screen, onNavigate, onLogin }) {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("veggie:theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  const dark = theme === "dark";
  const themeLabel = dark ? "Bật giao diện sáng" : "Bật giao diện tối";
  const toggleTheme = () => {
    const next = dark ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("veggie:theme", next);
    } catch {
      // Theme still works for the current visit when storage is unavailable.
    }
  };
  const links = [
    ...(user ? [["home", "Hôm nay"]] : []),
    [user ? "discover" : "home", "Khám phá"],
    ["planner", "Thực đơn"],
    ["community", "Cộng đồng"],
  ];
  const [toast, setToast] = useState("");
  const toastTimer = useRef();
  const returnTo = useRef(null);
  const flash = useCallback((message) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 5000);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const go = (target, id) => {
    if (
      ["login", "register"].includes(target) &&
      !["login", "register"].includes(screen)
    ) {
      returnTo.current = {
        screen,
        id: new URLSearchParams(window.location.search).get("id"),
      };
    }
    onNavigate(target);
    const params = new URLSearchParams();
    if (id != null) params.set("id", String(id));
    window.history.replaceState(
      {},
      "",
      `${target === "home" ? "/" : "/" + target}${params.size ? "?" + params : ""}`,
    );
  };
  const open = (id) => go("article-detail", id);
  useEffect(() => {
    document.getElementById("vp-main")?.focus({ preventScroll: true });
    document.title = `${screen === "home" && user ? "Bếp hôm nay" : titles[screen] || "VeggieAI"} · VeggieAI`;
  }, [screen, !!user]);
  const signOut = async () => {
    await logout();
    go("home");
    flash("Đã đăng xuất.");
  };
  const login = (u, token, outcome = {}) => {
    onLogin(u.role, u);
    if (!["admin", "moderator", "mod"].includes((u.role || "").toLowerCase())) {
      const destination = returnTo.current;
      returnTo.current = null;
      go(
        outcome.verified ? "welcome" : destination?.screen || "home",
        destination?.id,
      );
    }
  };
  const gate = guestCopy[screen] || [
    "Một góc bếp của riêng bạn.",
    "Đăng nhập để lưu món, quản lý bài viết và theo dõi những bữa ăn của bạn.",
  ];
  let content;
  if (screen === "me")
    content = <PersonalSpace user={user} go={go} signOut={signOut} />;
  else if (!user && protectedScreens.includes(screen))
    content = (
      <div className="vp-gate">
        <Leaf size={36} />
        <span className="vp-eyebrow">Không gian của bạn</span>
        <h1>{gate[0]}</h1>
        <p>{gate[1]}</p>
        <div className="vp-actions">
          <Button onClick={() => go("login")}>
            Đăng nhập <ArrowRight size={18} />
          </Button>
          <Button secondary onClick={() => go("register")}>
            Tạo tài khoản
          </Button>
        </div>
        <button className="vp-text-button" onClick={() => go("discover")}>
          Tiếp tục khám phá món chay
        </button>
      </div>
    );
  else if (screen === "login" || screen === "register")
    content = (
      <AuthForm
        key={screen}
        register={screen === "register"}
        go={go}
        onLogin={login}
      />
    );
  else if (screen === "welcome") content = <Welcome user={user} go={go} />;
  else if (screen === "article-detail")
    content = (
      <RecipeDetail
        key={window.location.search}
        id={new URLSearchParams(window.location.search).get("id")}
        go={go}
        user={user}
        flash={flash}
      />
    );
  else if (screen === "home" && user)
    content = (
      <Today
        key={user.id || user.email}
        user={user}
        go={go}
        open={open}
        flash={flash}
      />
    );
  else if (["home", "blog", "discover"].includes(screen))
    content = <Discover open={open} go={go} library={screen !== "home"} />;
  else if (
    ["planner", "create-plan", "create-mealplan", "meal-history"].includes(
      screen,
    )
  )
    content = (
      <Planner
        key={`${user?.id || user?.email}:${screen}`}
        go={go}
        flash={flash}
        open={open}
        history={screen === "meal-history"}
        hasProfile={user?.hasHealthProfile}
        create={["create-plan", "create-mealplan"].includes(screen)}
      />
    );
  else if (screen === "chatbot") content = <Chat />;
  else if (screen === "user-profile")
    content = <Profile flash={flash} go={go} />;
  else if (screen === "user-settings") content = <Account user={user} />;
  else if (["create-post", "create-video"].includes(screen))
    content = (
      <CreatePost
        key={user?.id || user?.email}
        go={go}
        user={user}
        video={screen === "create-video"}
      />
    );
  else if (["post-detail", "video-detail"].includes(screen))
    content = (
      <PostDetail
        key={`${screen}:${window.location.search}:${user?.id || "guest"}`}
        id={new URLSearchParams(window.location.search).get("id")}
        go={go}
        user={user}
        flash={flash}
      />
    );
  else if (["community", "user-posts", "videos"].includes(screen))
    content = (
      <Community
        key={screen}
        mine={screen === "user-posts"}
        videos={screen === "videos"}
        go={go}
        user={user}
        flash={flash}
      />
    );
  else if (screen === "user-collection")
    content = <Collection open={open} flash={flash} go={go} />;
  else if (screen === "user-nutrition") content = <Nutrition />;
  else if (screen === "notifications") content = <Notifications />;
  else
    content = (
      <div className="vp-empty">
        <h1>Nội dung chưa khả dụng</h1>
        <p>Khám phá các công thức chay và công cụ đang có trên VeggieAI.</p>
        <Button onClick={() => go("home")}>Về khám phá</Button>
      </div>
    );
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <div className={`vp vp-screen-${screen}`} data-theme={theme}>
          <a className="vp-skip" href="#vp-main">
            Đến nội dung chính
          </a>
          <header className="vp-header">
            <div className="vp-header-inner">
              <a
                className="vp-brand"
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  go("home");
                }}
              >
                <Leaf size={25} strokeWidth={1.7} />
                Veggie<span>AI</span>
              </a>
              <nav aria-label="Điều hướng chính" className="vp-nav">
                {links.map(([id, title]) => (
                  <a
                    key={id}
                    href={id === "home" ? "/" : "/" + id}
                    aria-current={
                      screen === id ||
                      (id === "community" &&
                        [
                          "post-detail",
                          "user-posts",
                          "create-post",
                          "create-video",
                          "videos",
                          "video-detail",
                        ].includes(screen))
                        ? "page"
                        : undefined
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      go(id);
                    }}
                  >
                    {title}
                  </a>
                ))}
              </nav>
              <div className="vp-header-actions">
                <button
                  type="button"
                  className="vp-icon vp-theme-toggle"
                  aria-label={themeLabel}
                  title={themeLabel}
                  onClick={toggleTheme}
                >
                  {dark ? (
                    <Sun size={19} aria-hidden="true" />
                  ) : (
                    <Moon size={19} aria-hidden="true" />
                  )}
                  <span aria-hidden="true">{dark ? "Sáng" : "Tối"}</span>
                </button>
                <button
                  className="vp-header-tool vp-desktop-tool"
                  title="Hỏi trợ lý"
                  aria-label="Hỏi trợ lý"
                  onClick={() => go("chatbot")}
                >
                  <MessageCircle size={20} />
                  <span>Hỏi trợ lý</span>
                </button>
                {user ? (
                  <>
                    <button
                      className="vp-icon"
                      aria-label="Thông báo"
                      onClick={() => go("notifications")}
                    >
                      <Bell size={20} />
                    </button>
                    <button
                      className="vp-account vp-desktop-account"
                      onClick={() => go("me")}
                    >
                      <User size={18} />
                      <span>Cá nhân</span>
                    </button>
                  </>
                ) : !["login", "register", "me"].includes(screen) ? (
                  <button className="vp-login" onClick={() => go("login")}>
                    Đăng nhập
                    <ArrowRight size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          </header>
          <main id="vp-main" className="vp-main" tabIndex={-1}>
            {![
              "home",
              "discover",
              "blog",
              "article-detail",
              "planner",
              "user-collection",
              "me",
              "login",
              "register",
              "welcome",
              "community",
              "videos",
              "post-detail",
              "video-detail",
              "create-post",
              "create-video",
            ].includes(screen) && (
              <button
                className="vp-mobile-back"
                onClick={() => go("me")}
              >
                <ArrowLeft size={18} />
                Quay lại
              </button>
            )}
            <div className="vp-screen" key={screen}>
              <Suspense
                fallback={
                  <div className="vp-loading" role="status">
                    <span className="vp-spinner" />
                    Đang tải…
                  </div>
                }
              >
                {content}
              </Suspense>
            </div>
          </main>
          <footer className="vp-footer">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                go("home");
              }}
            >
              <Leaf size={18} /> VeggieAI
            </a>
            <p>Ăn chay mỗi ngày, theo cách của bạn.</p>
            <span>Thông tin dinh dưỡng mang tính tham khảo.</span>
          </footer>
          <BottomNav screen={screen} go={go} user={user} />
          {toast && (
            <div className="vp-toast" role="status">
              {toast}
              <button aria-label="Đóng thông báo" onClick={() => setToast("")}>
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </LazyMotion>
    </MotionConfig>
  );
}
