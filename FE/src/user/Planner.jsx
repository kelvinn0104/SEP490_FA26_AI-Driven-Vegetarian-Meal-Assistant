import { useRef, useState } from "react";
import { AiActivity } from "./AiActivity";
import {
  Plus,
  ArrowRight,
  RefreshCw,
  Check,
  ShoppingBasket,
  CalendarDays,
  Flame,
  Sunrise,
  Sun,
  Moon,
  Apple,
} from "lucide-react";
import {
  useResource,
  Button,
  State,
  Notice,
  PageHeading,
  PageControls,
  Dialog,
  MealImage,
} from "./ui";
import {
  amount,
  listOf,
  userError,
  statusLabel,
  isTestContent,
  vietnamDate,
  mealLabels,
  safeImage,
} from "./data";
import { request } from "./api";

function formatPlanDate(date, withYear = false) {
  if (!date) return "—";
  return new Date(date + "T12:00:00").toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
    ...(withYear && { year: "numeric" }),
  });
}
const mealIcons = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
  snack: Apple,
};

function DayOverview({ day }) {
  const meals = day.meals || [];
  const hasEnergy =
    meals.length > 0 &&
    meals.every(
      (meal) =>
        typeof meal.nutrition?.kcal === "number" &&
        Number.isFinite(meal.nutrition.kcal) &&
        meal.nutrition.kcal >= 0,
    );
  const energy = hasEnergy
    ? meals.reduce((sum, meal) => sum + meal.nutrition.kcal, 0)
    : 0;
  return (
    <section
      className="vp-plan-nutrients"
      aria-label="Dinh dưỡng dự kiến trong ngày"
    >
      <div className="vp-plan-energy">
        <span className="vp-eyebrow">
          <Flame size={16} /> Theo thực đơn
        </span>
        <strong>
          {amount(day.total?.kcal)} <small>kcal</small>
        </strong>
        <span>{meals.length} bữa trong ngày</span>
      </div>
      <div className="vp-plan-macros">
        <dl>
          {[
            ["proteinG", "Đạm"],
            ["carbG", "Tinh bột"],
            ["fatG", "Chất béo"],
          ].map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>
                {amount(day.total?.[key])} <small>g</small>
              </dd>
            </div>
          ))}
        </dl>
        {energy > 0 ? (
          <>
            <div className="vp-plan-energy-split" aria-hidden="true">
              {meals.map((meal) => (
                <span
                  key={meal.id}
                  data-meal={meal.mealType}
                  style={{ flexGrow: meal.nutrition.kcal / energy }}
                />
              ))}
            </div>
            <div className="vp-plan-energy-legend">
              {meals.map((meal) => (
                <span key={meal.id} data-meal={meal.mealType}>
                  <i aria-hidden="true" />
                  {mealLabels[meal.mealType] || meal.mealType} ·{" "}
                  {amount(meal.nutrition.kcal)} kcal
                </span>
              ))}
            </div>
          </>
        ) : (
          <p>Phân bổ năng lượng sẽ hiện khi có đủ dữ liệu từng bữa.</p>
        )}
        <small>Dinh dưỡng dự kiến từ món trong thực đơn.</small>
      </div>
    </section>
  );
}

function PlanMealVisual({ meal }) {
  const Icon = mealIcons[meal.mealType] || CalendarDays;
  if (safeImage(meal.imageUrl)) return <MealImage meal={meal} />;
  return (
    <div
      className="vp-plan-meal-art"
      data-meal={meal.mealType}
      aria-hidden="true"
    >
      <span />
      <Icon size={38} strokeWidth={1.2} />
      <span />
    </div>
  );
}

export function Planner({ go, flash, open, history, create, hasProfile }) {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(!!create);
  const [profileRequired, setProfileRequired] = useState(false);
  const resource = useResource(
    (signal) =>
      request(
        history
          ? `/meal-plans?page.Page=${page}&page.PageSize=10`
          : "/meal-plans/current",
        undefined,
        undefined,
        signal,
      ),
    [history, page],
  );
  const [generated, setGenerated] = useState(null);
  const [busy, setBusy] = useState(null);
  const lock = useRef(false);
  const [error, setError] = useState("");
  const [days, setDays] = useState(7);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(vietnamDate());
  const [goal, setGoal] = useState("maintain");
  const [shopping, setShopping] = useState(null);
  const [shoppingOpen, setShoppingOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(vietnamDate());
  const [warnings, setWarnings] = useState([]);
  const plan = generated || resource.data;
  const selectedDay =
    plan?.days?.find((day) => day.date === selectedDate) || plan?.days?.[0];
  const testPlan = plan?.days?.some((day) =>
    day.meals?.some((meal) => isTestContent({ title: meal.recipeTitle })),
  );
  const action = async (fn, success, task = {}) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(task);
    setError("");
    try {
      const res = await fn();
      if (success) flash(success);
      return res;
    } catch (e) {
      setError(userError(e));
    } finally {
      lock.current = false;
      setBusy(null);
    }
  };
  const generate = (e) => {
    e.preventDefault();
    action(
      async () => {
        setProfileRequired(false);
        try {
          await request("/health-profile");
        } catch (error) {
          if (error.status === 404) {
            setProfileRequired(true);
            throw new Error("Thiết lập hồ sơ sức khỏe trước khi tạo thực đơn.");
          }
          throw error;
        }
        setBusy({ kind: "generate" });
        const result = await request("/meal-plans/ai/generate", {
          startDate: date,
          days: Number(days),
          mealTypes: ["breakfast", "lunch", "dinner"],
          healthGoal: goal,
          note,
        });
        const next = result?.plan;
        if (!next?.days?.length)
          throw new Error("Chưa nhận được thực đơn hợp lệ. Vui lòng thử lại.");
        if (
          next.days.some((day) =>
            day.meals?.some((meal) =>
              isTestContent({ title: meal.recipeTitle }),
            ),
          )
        )
          throw new Error(
            "Máy chủ trả về món thử nghiệm. Chưa thể sử dụng thực đơn này.",
          );
        setGenerated(next);
        setEditing(false);
        setWarnings(result.validationWarnings || []);
        setShopping(null);
        setSelectedDate(next.days[0].date);
      },
      "Đã tạo thực đơn. Kiểm tra các bữa trước khi sử dụng.",
      { kind: "profile" },
    );
  };
  const swap = (meal) =>
    action(
      async () => {
        const result = await request(
          `/meal-plans/ai/${plan.id}/items/${meal.id}/swap`,
          { reason: "Tôi muốn đổi món khác phù hợp với hồ sơ và dị ứng." },
        );
        const next =
          result?.plan ||
          (result?.days ? result : await request(`/meal-plans/${plan.id}`));
        if (!next?.days?.length)
          throw new Error("Chưa xác nhận được thực đơn sau khi đổi món.");
        setGenerated(next);
      },
      "Đã đổi món.",
      { kind: "swap", mealId: meal.id },
    );
  if (hasProfile === false)
    return (
      <>
        <PageHeading title="Thực đơn của bạn" />
        <section className="vp-profile-complete">
          <h2>Thêm hồ sơ trước khi lên thực đơn</h2>
          <p>
            Chỉ số cơ thể và dị ứng giúp chọn món phù hợp. Bạn chỉ cần thiết lập
            một lần.
          </p>
          <div className="vp-actions">
            <Button onClick={() => go("user-profile")}>Thiết lập hồ sơ</Button>
            <Button secondary onClick={() => go("home")}>
              Khám phá món
            </Button>
          </div>
        </section>
      </>
    );
  if (history && !generated)
    return (
      <>
        <PageHeading eyebrow="Thực đơn" title="Lịch sử thực đơn">
          <Button onClick={() => go("create-plan")}>
            <Plus size={17} />
            Tạo thực đơn
          </Button>
        </PageHeading>
        {error && <Notice error>{error}</Notice>}
        <div className="vp-plan-history">
          <State resource={resource} empty="Bạn chưa có thực đơn nào">
            {listOf(resource.data).map((p) => (
              <article className="vp-list-card vp-plan-history-card" key={p.id}>
                <CalendarDays size={22} aria-hidden="true" />
                <div>
                  <h3>
                    {formatPlanDate(p.startDate, true)} –{" "}
                    {formatPlanDate(p.endDate, true)}
                  </h3>
                  <p>
                    {statusLabel(p.status)}
                    {p.itemCount != null && ` · ${p.itemCount} bữa`}
                  </p>
                </div>
                <Button
                  secondary
                  disabled={!!busy}
                  onClick={() =>
                    action(async () =>
                      setGenerated(await request(`/meal-plans/${p.id}`)),
                    )
                  }
                >
                  Xem thực đơn
                </Button>
              </article>
            ))}
          </State>
        </div>
        <PageControls
          data={resource.data}
          page={page}
          setPage={setPage}
          disabled={resource.loading}
        />
      </>
    );
  return (
    <>
      <PageHeading
        eyebrow="Bữa ăn của bạn"
        title={editing ? "Tạo thực đơn" : "Thực đơn"}
      >
        <div className="vp-plan-heading-actions">
          <button
            className="vp-text-button"
            onClick={() => (history ? setGenerated(null) : go("meal-history"))}
          >
            Lịch sử <ArrowRight size={16} />
          </button>
          {editing && (
            <button
              className="vp-text-button"
              disabled={!!busy}
              onClick={() => setEditing(false)}
            >
              Hủy tạo mới
            </button>
          )}
          {!editing && plan?.days && (
            <Button secondary onClick={() => setEditing(true)}>
              <Plus size={17} />
              Tạo mới
            </Button>
          )}
        </div>
      </PageHeading>
      {!editing && !resource.loading && !plan?.days && (
        <section className="vp-planner-start vp-editorial-banner">
          <div>
            <span className="vp-eyebrow">Kế hoạch bữa ăn</span>
            <h2>Bạn muốn lên lịch cho những ngày nào?</h2>
            <p>Chọn ngày bắt đầu, số ngày và món bạn thích.</p>
            <Button onClick={() => setEditing(true)}>
              <Plus size={17} />
              Tạo thực đơn mới
            </Button>
          </div>
          <img
            src="/images/brand/shared-table.webp"
            width="960"
            height="640"
            alt=""
          />
        </section>
      )}
      <div className={`vp-planner-layout ${editing ? "" : "vp-plan-view"}`}>
        {editing && (
          <form className="vp-panel" onSubmit={generate}>
            <fieldset className="vp-plan-fields" disabled={!!busy}>
              <h2>Thông tin thực đơn</h2>
              <div className="vp-plan-date-fields">
                <label>
                  Ngày bắt đầu
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
                <label>
                  Số ngày
                  <input
                    type="number"
                    min="1"
                    max="14"
                    required
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                  />
                </label>
              </div>
              <div
                className="vp-type-filter vp-days-shortcuts"
                role="group"
                aria-label="Chọn nhanh số ngày"
              >
                {[3, 7, 14].map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={Number(days) === value}
                    onClick={() => setDays(value)}
                  >
                    {value} ngày
                  </button>
                ))}
              </div>
              <label>
                Mục tiêu
                <select value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="maintain">Duy trì cân nặng</option>
                  <option value="loss">Giảm cân</option>
                  <option value="gain">Tăng cân</option>
                </select>
              </label>
              <label>
                Sở thích, lưu ý
                <textarea
                  maxLength={500}
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: món Việt, ít cay…"
                />
              </label>
              <small>
                Dị ứng phải được lưu trong hồ sơ sức khỏe trước khi tạo thực
                đơn.
              </small>
              <div className="vp-plan-form-actions">
                <Button disabled={!!busy}>
                  {busy?.kind === "profile"
                    ? "Đang kiểm tra hồ sơ…"
                    : busy
                      ? "Đang tạo thực đơn…"
                      : "Tạo thực đơn"}
                  <ArrowRight size={17} />
                </Button>
                <button
                  type="button"
                  className="vp-text-button"
                  onClick={() => go("user-profile")}
                >
                  Kiểm tra hồ sơ sức khỏe
                </button>
              </div>
            </fieldset>
            {error && <Notice error>{error}</Notice>}
            {profileRequired && (
              <Button secondary onClick={() => go("user-profile")}>
                Thiết lập hồ sơ
              </Button>
            )}
            {busy?.kind === "generate" && <AiActivity kind="generate" />}
          </form>
        )}
        <section>
          {!editing && !shoppingOpen && error && <Notice error>{error}</Notice>}
          {warnings.map((w, i) => (
            <Notice key={i}>{w}</Notice>
          ))}
          {!editing && !generated && (resource.loading || resource.error) && (
            <State resource={resource} />
          )}
          {editing && (
            <aside className="vp-plan-intro">
              <img
                className="vp-plan-intro-photo"
                src="/images/brand/shared-table.webp"
                width="960"
                height="640"
                alt=""
              />
              <span className="vp-eyebrow">
                Một kế hoạch, nhẹ việc mỗi ngày
              </span>
              <h2>
                Bớt nghĩ mỗi bữa.
                <br />
                <em>Thêm thời gian vào bếp.</em>
              </h2>
              <p>
                Chọn số ngày và sở thích. Dị ứng được lấy từ hồ sơ sức khỏe đã
                lưu.
              </p>
              <ol>
                <li>
                  <span>01</span>Chọn nhu cầu
                </li>
                <li>
                  <span>02</span>Kiểm tra các bữa
                </li>
                <li>
                  <span>03</span>Mang danh sách đi chợ
                </li>
              </ol>
            </aside>
          )}
          {testPlan && (
            <Notice error>
              Thực đơn này có món thử nghiệm và chưa thể sử dụng. Bạn có thể tạo
              thực đơn khác.
            </Notice>
          )}
          {!editing && !testPlan && plan?.days && (
            <>
              <div className="vp-plan-overview">
                <div className="vp-section-heading">
                  <div>
                    <span className="vp-eyebrow">
                      Lịch bữa ăn · {plan.days.length} ngày
                    </span>
                    <h2>
                      {formatPlanDate(plan.startDate)} –{" "}
                      {formatPlanDate(plan.endDate)}
                    </h2>
                  </div>
                  <span className="vp-plan-status">
                    {statusLabel(plan.status)}
                  </span>
                </div>
                <div className="vp-actions">
                  {plan.status !== "active" && (
                    <Button
                      disabled={!!busy}
                      onClick={() =>
                        action(async () => {
                          const activated = await request(
                            `/meal-plans/${plan.id}/status`,
                            { status: "active" },
                            "PATCH",
                          );
                          setGenerated(activated);
                        }, "Đã kích hoạt thực đơn.")
                      }
                    >
                      Dùng thực đơn này
                    </Button>
                  )}
                  <Button
                    secondary={plan.status !== "active"}
                    disabled={!!busy}
                    onClick={() =>
                      action(async () => {
                        try {
                          setShopping(
                            await request(
                              `/meal-plans/${plan.id}/shopping-list`,
                            ),
                          );
                        } catch (error) {
                          if (error.status !== 404) throw error;
                          setShopping(
                            await request(
                              `/meal-plans/${plan.id}/shopping-list`,
                              {},
                            ),
                          );
                        }
                        setShoppingOpen(true);
                      })
                    }
                  >
                    <ShoppingBasket size={18} />
                    Danh sách đi chợ
                  </Button>
                </div>
              </div>
              <nav className="vp-day-picker" aria-label="Ngày trong thực đơn">
                {plan.days.map((day) => (
                  <button
                    key={day.date}
                    aria-pressed={day.date === selectedDay?.date}
                    onClick={() => setSelectedDate(day.date)}
                  >
                    <span>
                      {new Date(day.date + "T12:00:00").toLocaleDateString(
                        "vi-VN",
                        { weekday: "short" },
                      )}
                    </span>
                    <strong>
                      {new Date(day.date + "T12:00:00").getDate()}
                    </strong>
                    <small>
                      Tháng {new Date(day.date + "T12:00:00").getMonth() + 1}
                    </small>
                  </button>
                ))}
              </nav>
              {[selectedDay].filter(Boolean).map((day) => (
                <article className="vp-day" key={day.date}>
                  <h3>
                    {new Date(day.date + "T12:00:00").toLocaleDateString(
                      "vi-VN",
                      { weekday: "long", day: "numeric", month: "numeric" },
                    )}
                  </h3>
                  <DayOverview day={day} />
                  {!day.meals?.length && (
                    <p className="vp-day-empty">Ngày này chưa có món.</p>
                  )}
                  <div className="vp-meal-cards">
                    {day.meals?.map((meal) => (
                      <div className="vp-meal" key={meal.id}>
                        <PlanMealVisual meal={meal} />
                        <div>
                          <span className="vp-eyebrow">
                            {mealLabels[meal.mealType] || meal.mealType}
                          </span>
                          <button onClick={() => open(meal.recipeId)}>
                            {meal.recipeTitle}
                          </button>
                          <small>
                            {amount(meal.servings)} khẩu phần ·{" "}
                            {amount(meal.nutrition?.kcal)} kcal
                          </small>
                        </div>
                        <div className="vp-actions">
                          <button
                            className="vp-icon"
                            disabled={!!busy}
                            aria-label={`Đổi ${meal.recipeTitle}`}
                            onClick={() => swap(meal)}
                          >
                            <RefreshCw size={17} />
                            <span>Đổi món</span>
                          </button>
                          <button
                            className="vp-icon"
                            disabled={!!busy}
                            aria-label={`Ghi nhận đã ăn ${meal.recipeTitle}`}
                            onClick={() =>
                              action(
                                () =>
                                  request("/nutrition/logs", {
                                    planItemId: meal.id,
                                  }),
                                "Đã ghi nhận bữa ăn.",
                              )
                            }
                          >
                            <Check size={19} />
                            <span>Đã ăn</span>
                          </button>
                        </div>
                        {busy?.kind === "swap" && busy.mealId === meal.id && (
                          <AiActivity kind="swap" />
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
              {shopping && shoppingOpen && (
                <Dialog
                  title="Danh sách đi chợ"
                  className="vp-sheet vp-plan-shopping"
                  busy={!!busy}
                  close={() => setShoppingOpen(false)}
                >
                  {error && <Notice error>{error}</Notice>}
                  <p className="vp-shopping-summary">
                    {
                      listOf(shopping.items || shopping).filter(
                        (item) => item.isBought,
                      ).length
                    }
                    /{listOf(shopping.items || shopping).length} nguyên liệu đã
                    mua
                  </p>
                  {listOf(shopping.items || shopping).map((item) => (
                    <label className="vp-check" key={item.id}>
                      <input
                        type="checkbox"
                        checked={!!item.isBought}
                        disabled={!!busy}
                        onChange={(e) => {
                          const value = e.target.checked;
                          action(async () => {
                            await request(
                              `/meal-plans/${plan.id}/shopping-list/items/${item.id}`,
                              { isBought: value },
                              "PATCH",
                            );
                            setShopping((prev) => ({
                              ...prev,
                              items: listOf(prev.items || prev).map((i) =>
                                i.id === item.id
                                  ? { ...i, isBought: value }
                                  : i,
                              ),
                            }));
                          });
                        }}
                      />
                      {item.ingredientName || item.name} ·{" "}
                      {amount(item.quantityG ?? item.quantity)} g
                    </label>
                  ))}
                </Dialog>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
