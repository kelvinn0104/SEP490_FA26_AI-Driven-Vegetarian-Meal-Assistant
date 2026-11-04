import {
  Home,
  CalendarDays,
  Bookmark,
  UserRound,
  Camera,
  MessageCircle,
  HeartPulse,
  History,
  Activity,
  FileText,
  Bell,
  Settings,
  ChevronRight,
  LogOut,
  Users,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "./ui";
import { m } from "motion/react";
const tabs = [
  ["home", "Khám phá", Home],
  ["planner", "Thực đơn", CalendarDays],
  ["community", "Cộng đồng", Users],
  ["user-collection", "Đã lưu", Bookmark],
  ["me", "Cá nhân", UserRound],
];
export function activeTab(screen) {
  if (["home", "blog", "article-detail", "discover"].includes(screen))
    return "home";
  if (
    [
      "community",
      "post-detail",
      "videos",
      "video-detail",
      "create-post",
      "create-video",
      "user-posts",
    ].includes(screen)
  )
    return "community";
  if (
    ["planner", "create-plan", "create-mealplan", "meal-history"].includes(
      screen,
    )
  )
    return "planner";
  if (screen === "user-collection") return "user-collection";
  return "me";
}
export function BottomNav({ screen, go, user }) {
  return (
    <nav className="vp-bottom-nav" aria-label="Điều hướng nhanh">
      {tabs.map(([id, label, Icon]) => (
        <a
          key={id}
          href={id === "home" ? "/" : "/" + id}
          aria-current={activeTab(screen) === id ? "page" : undefined}
          onClick={(e) => {
            e.preventDefault();
            go(id);
          }}
        >
          {activeTab(screen) === id && (
            <m.span
              className="vp-nav-indicator"
              layoutId="user-bottom-active"
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            />
          )}
          <Icon size={21} strokeWidth={1.7} />
          <span>{id === "home" && user ? "Hôm nay" : label}</span>
        </a>
      ))}
    </nav>
  );
}
const groups = [
  [
    "Bữa ăn của bạn",
    [
      ["user-profile", "Hồ sơ sức khỏe", HeartPulse],
      ["user-collection", "Món đã lưu", Bookmark],
      ["meal-history", "Lịch sử thực đơn", History],
      ["user-nutrition", "Nhật ký dinh dưỡng", Activity],
    ],
  ],
  [
    "Khám phá thêm",
    [
      ["vision", "Quét nguyên liệu", Camera],
      ["chatbot", "Hỏi trợ lý", MessageCircle],
      ["community", "Cộng đồng", Users],
    ],
  ],
  [
    "Quản lý",
    [
      ["user-posts", "Bài viết của tôi", FileText],
      ["notifications", "Thông báo", Bell],
      ["user-settings", "Cài đặt tài khoản", Settings],
    ],
  ],
];
export function PersonalSpace({ user, go, signOut }) {
  return (
    <div className="vp-personal">
      <header className="vp-personal-header">
        <span className="vp-personal-avatar">
          <UserRound size={28} />
        </span>
        <div>
          <h1>{user?.name || user?.displayName || "Cá nhân"}</h1>
          <p>{user?.email || "Đăng nhập để lưu món và quản lý bữa ăn."}</p>
        </div>
      </header>
      {!user && (
        <div className="vp-actions">
          <Button onClick={() => go("login")}>Đăng nhập</Button>
          <Button secondary onClick={() => go("register")}>
            Tạo tài khoản
          </Button>
        </div>
      )}
      {user && user.hasHealthProfile === false && (
        <button
          className="vp-profile-reminder"
          onClick={() => go("user-profile")}
        >
          <HeartPulse size={22} />
          <span>
            Hoàn thiện hồ sơ sức khỏe
            <small>Để thực đơn phù hợp với bạn hơn</small>
          </span>
          <ChevronRight size={18} />
        </button>
      )}
      <div className="vp-personal-groups">
        {groups.map(([title, items]) => (
          <section key={title}>
            <h2>{title}</h2>
            <div className="vp-link-list">
              {items.map(([id, label, Icon]) => (
                <a
                  key={id}
                  href={"/" + id}
                  onClick={(e) => {
                    e.preventDefault();
                    go(id);
                  }}
                >
                  <Icon size={20} strokeWidth={1.6} />
                  <span>{label}</span>
                  <ChevronRight size={17} />
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
      {user && (
        <button className="vp-signout" onClick={signOut}>
          <LogOut size={18} />
          Đăng xuất
        </button>
      )}
    </div>
  );
}
export function Welcome({ user, go }) {
  const ready = user.hasHealthProfile === true;
  return (
    <section className="vp-welcome">
      <span className="vp-welcome-mark">
        <Check size={30} />
      </span>
      <span className="vp-eyebrow">Tài khoản đã sẵn sàng</span>
      <h1>Chào bạn đến với VeggieAI.</h1>
      <p>
        {ready
          ? "Bạn muốn bắt đầu từ đâu?"
          : "Bạn có thể khám phá món ngay. Hồ sơ sức khỏe chỉ cần khi lên thực đơn cá nhân."}
      </p>
      <ol className="vp-onboarding-path">
        <li className="done">
          <Check size={17} />
          <span>Email đã xác thực</span>
        </li>
        <li className={ready ? "done" : ""}>
          {ready ? <Check size={17} /> : <HeartPulse size={18} />}
          <span>
            Hồ sơ sức khỏe
            <small>{ready ? "Đã thiết lập" : "Tự chọn, có thể làm sau"}</small>
          </span>
        </li>
        <li>
          <CalendarDays size={18} />
          <span>
            Thực đơn của bạn<small>Chỉ tạo khi bạn yêu cầu</small>
          </span>
        </li>
      </ol>
      <div className="vp-actions">
        <Button onClick={() => go(ready ? "discover" : "user-profile")}>
          {ready ? "Khám phá món" : "Thiết lập hồ sơ"}
          <ArrowRight size={17} />
        </Button>
        <Button secondary onClick={() => go(ready ? "planner" : "discover")}>
          {ready ? "Xem thực đơn" : "Để sau, khám phá món"}
        </Button>
      </div>
    </section>
  );
}
