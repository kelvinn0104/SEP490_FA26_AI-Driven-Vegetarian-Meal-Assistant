import { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  MessageCircle,
  CalendarDays,
  Check,
  HeartPulse,
  BookOpen,
} from "lucide-react";
import {
  useResource,
  Button,
  State,
  Notice,
  NutrientMeter,
  EnergyGauge,
  MealImage,
} from "./ui";
import { request } from "./api";
import {
  amount,
  vietnamDate,
  mealsForDate,
  mealLabels,
  userError,
  isTestContent,
} from "./data";

export function Today({ user, go, open, flash }) {
  const [date, setDate] = useState(vietnamDate);
  useEffect(() => {
    const refresh = () => setDate(vietnamDate());
    const timer = setInterval(refresh, 60000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  const plan = useResource(
    (signal) => request("/meal-plans/current", undefined, undefined, signal),
    [user.id],
  );
  const daily = useResource(
    (signal) =>
      request(`/nutrition/daily?date=${date}`, undefined, undefined, signal),
    [user.id, date],
  );
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const meals = mealsForDate(plan.data, date, daily.data?.logs);
  const invalidPlan = plan.data?.days?.some((day) =>
    day.meals?.some((meal) => isTestContent({ title: meal.recipeTitle })),
  );
  const log = async (meal) => {
    if (lock.current || daily.loading || daily.error || meal.recorded) return;
    lock.current = true;
    setBusy(meal.id);
    setError("");
    try {
      const saved = await request("/nutrition/logs", { planItemId: meal.id });
      if (!saved?.id)
        throw new Error(
          "Chưa xác nhận được bữa ăn. Kiểm tra nhật ký trước khi ghi tiếp.",
        );
      daily.reload();
      flash("Đã ghi nhận bữa ăn.");
    } catch (e) {
      setError(userError(e));
    } finally {
      lock.current = false;
      setBusy(null);
    }
  };
  return (
    <div className="vp-today">
      <header className="vp-today-heading">
        <div>
          <span className="vp-eyebrow">
            {new Intl.DateTimeFormat("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              weekday: "long",
              day: "numeric",
              month: "long",
            }).format(new Date())}
          </span>
          <h1>
            Bếp hôm nay<span>.</span>
          </h1>
          <p>Chào {user.displayName || user.name || "bạn"}. Hôm nay ăn gì?</p>
        </div>
        <Button secondary onClick={() => go("discover")}>
          Khám phá món
          <ArrowUpRight size={18} />
        </Button>
      </header>
      <div className="vp-today-layout">
        <aside className="vp-today-nutrition">
          <div className="vp-section-heading">
            <h2>Đã ghi nhận</h2>
            <button
              className="vp-text-button"
              aria-label="Mở nhật ký dinh dưỡng"
              onClick={() => go("user-nutrition")}
            >
              Nhật ký
              <ArrowUpRight size={16} />
            </button>
          </div>
          <State resource={daily} empty="Chưa có nhật ký hôm nay">
            {daily.data && (
              <>
                <EnergyGauge
                  value={daily.data.consumed?.kcal}
                  target={daily.data.target?.kcal}
                />
                <div className="vp-today-macros">
                  {[
                    ["Đạm", "proteinG"],
                    ["Béo", "fatG"],
                    ["Tinh bột", "carbG"],
                  ].map(([label, key]) => (
                    <NutrientMeter
                      key={key}
                      label={label}
                      value={daily.data.consumed?.[key]}
                      target={daily.data.target?.[key]}
                      unit="g"
                    />
                  ))}
                </div>
              </>
            )}
          </State>
        </aside>
        <section className="vp-today-plan">
          <div className="vp-section-heading">
            <h2>Trên thực đơn</h2>
            <button className="vp-text-button" onClick={() => go("planner")}>
              Xem thực đơn
              <ArrowRight size={16} />
            </button>
          </div>
          {error && <Notice error>{error}</Notice>}
          {invalidPlan ? (
            <Notice error>
              Thực đơn chứa món thử nghiệm, chưa thể sử dụng. Bạn có thể tạo
              thực đơn khác.
            </Notice>
          ) : (
            <State
              resource={plan}
              empty="Bếp đang chờ một kế hoạch mới"
              emptyAction={
                <>
                  <p>
                    Chọn thực đơn khi bạn sẵn sàng. Hôm nay, cứ bắt đầu từ một
                    món bạn thích.
                  </p>
                  <Button
                    onClick={() =>
                      go(
                        user.hasHealthProfile === false
                          ? "user-profile"
                          : "planner",
                      )
                    }
                  >
                    {user.hasHealthProfile === false
                      ? "Thiết lập hồ sơ"
                      : "Lên thực đơn"}
                    <ArrowRight size={17} />
                  </Button>
                </>
              }
            >
              {meals.length ? (
                <div className="vp-today-meals">
                  {meals.map((meal) => (
                    <article
                      className={`vp-today-meal ${meal.recorded ? "is-recorded" : ""}`}
                      key={meal.id}
                    >
                      <MealImage meal={meal} />
                      <div>
                        <span className="vp-eyebrow">
                          {mealLabels[meal.mealType] || meal.mealType}
                        </span>
                        <h3>
                          <button onClick={() => open(meal.recipeId)}>
                            {meal.recipeTitle}
                          </button>
                        </h3>
                        <p>
                          {amount(meal.nutrition?.kcal)} kcal ·{" "}
                          {amount(meal.servings)} khẩu phần
                        </p>
                      </div>
                      <button
                        className="vp-record-meal"
                        disabled={
                          busy != null ||
                          daily.loading ||
                          !!daily.error ||
                          meal.recorded
                        }
                        aria-label={`Ghi nhận đã ăn ${meal.recipeTitle}`}
                        onClick={() => log(meal)}
                      >
                        <Check size={18} />
                        <span>
                          {meal.recorded
                            ? "Đã ghi"
                            : busy === meal.id
                              ? "Đang lưu…"
                              : "Đã ăn"}
                        </span>
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="vp-today-no-meals">
                  <CalendarDays size={34} strokeWidth={1.2} />
                  <h3>Hôm nay chưa có bữa trong thực đơn</h3>
                  <p>Thực đơn đang dùng có thể thuộc ngày khác.</p>
                  <Button secondary onClick={() => go("planner")}>
                    Mở thực đơn
                    <ArrowRight size={17} />
                  </Button>
                </div>
              )}
            </State>
          )}
        </section>
      </div>
      {user.hasHealthProfile === false && (
        <button
          className="vp-profile-reminder"
          onClick={() => go("user-profile")}
        >
          <HeartPulse size={22} />
          <span>
            Thêm hồ sơ sức khỏe
            <small>Để lên thực đơn theo nhu cầu và dị ứng của bạn</small>
          </span>
          <ArrowRight size={18} />
        </button>
      )}
      <section className="vp-today-tools" aria-label="Công cụ bếp">
        {[
          [
            "chatbot",
            "Hỏi trợ lý bếp",
            "Thay nguyên liệu, tìm cách nấu",
            MessageCircle,
          ],
          [
            "community",
            "Ghé bếp mọi người",
            "Đọc chuyện bếp và chia sẻ",
            BookOpen,
          ],
        ].map(([id, title, text, Icon]) => (
          <button key={id} onClick={() => go(id)}>
            <Icon size={24} strokeWidth={1.4} />
            <span>
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
            <ArrowUpRight size={19} />
          </button>
        ))}
      </section>
    </div>
  );
}
