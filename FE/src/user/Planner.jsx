import { useState } from "react";
import { Plus, ArrowRight, RefreshCw, Check } from "lucide-react";
import {
  useResource,
  Button,
  State,
  Notice,
  PageHeading,
  PageControls,
} from "./ui";
import { amount, listOf, userError, statusLabel, isTestContent } from "./data";
import { request } from "./api";
export function Planner({ go, flash, open, history, create, hasProfile }) {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(!!create);
  const [profileRequired, setProfileRequired] = useState(false);
  const resource = useResource(
    () =>
      request(
        history
          ? `/meal-plans?page.Page=${page}&page.PageSize=10`
          : "/meal-plans/current",
      ),
    [history, page],
  );
  const [generated, setGenerated] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [days, setDays] = useState(7);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [goal, setGoal] = useState("maintain");
  const [shopping, setShopping] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const plan = generated || resource.data;
  const testPlan = plan?.days?.some((day) =>
    day.meals?.some((meal) => isTestContent({ title: meal.recipeTitle })),
  );
  const action = async (fn, success) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fn();
      if (success) flash(success);
      return res;
    } catch (e) {
      setError(userError(e));
    } finally {
      setBusy(false);
    }
  };
  const generate = (e) => {
    e.preventDefault();
    action(async () => {
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
          day.meals?.some((meal) => isTestContent({ title: meal.recipeTitle })),
        )
      )
        throw new Error(
          "Máy chủ trả về món thử nghiệm. Chưa thể sử dụng thực đơn này.",
        );
      setGenerated(next);
      setEditing(false);
      setWarnings(result.validationWarnings || []);
      setShopping(null);
    }, "Đã tạo thực đơn. Kiểm tra các bữa trước khi sử dụng.");
  };
  const swap = (meal) =>
    action(async () => {
      const result = await request(
        `/meal-plans/ai/${plan.id}/items/${meal.id}/swap`,
        { reason: "Tôi muốn đổi món khác phù hợp với hồ sơ và dị ứng." },
      );
      const next = result?.plan || (result?.days ? result : null);
      if (next) setGenerated(next);
      else {
        const refreshed = await request(`/meal-plans/${plan.id}`);
        setGenerated(refreshed);
      }
    }, "Đã đổi món.");
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
        <PageHeading title="Lịch sử thực đơn">
          <Button onClick={() => go("create-plan")}>
            <Plus size={17} />
            Tạo thực đơn
          </Button>
        </PageHeading>
        {error && <Notice error>{error}</Notice>}
        <State resource={resource}>
          {listOf(resource.data).map((p) => (
            <article className="vp-list-card" key={p.id}>
              <h3>
                {p.startDate} – {p.endDate}
              </h3>
              <p>
                {statusLabel(p.status)} · {p.itemCount} bữa
              </p>
              <Button
                secondary
                disabled={busy}
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
      <PageHeading title={editing ? "Tạo thực đơn" : "Thực đơn của bạn"}>
        <button className="vp-text-button" onClick={() => go("meal-history")}>
          Lịch sử <ArrowRight size={16} />
        </button>
      </PageHeading>
      {!editing && (
        <div className="vp-planner-start">
          <Button onClick={() => setEditing(true)}>
            <Plus size={17} />
            Tạo thực đơn mới
          </Button>
          <p>Chọn ngày và nhu cầu khi bạn muốn bắt đầu.</p>
        </div>
      )}
      {editing && (
        <button
          className="vp-text-button"
          disabled={busy}
          onClick={() => setEditing(false)}
        >
          Hủy tạo mới
        </button>
      )}
      <div className={`vp-planner-layout ${editing ? "" : "vp-plan-view"}`}>
        {editing && (
          <form className="vp-panel" onSubmit={generate}>
            <fieldset className="vp-plan-fields" disabled={busy}>
              <h2>Sắp xếp bữa ăn</h2>
              <p>Từ công thức trong thư viện, theo hồ sơ sức khỏe đã lưu.</p>
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
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: món Việt, ít cay…"
                />
              </label>
              <small>
                Dị ứng phải được lưu trong hồ sơ sức khỏe trước khi tạo thực
                đơn.
              </small>
              <Button disabled={busy}>
                {busy ? "Đang xử lý…" : "Tạo thực đơn"}
                <ArrowRight size={17} />
              </Button>
              <button
                type="button"
                className="vp-text-button"
                onClick={() => go("user-profile")}
              >
                Kiểm tra hồ sơ sức khỏe
              </button>
            </fieldset>
          </form>
        )}
        <section>
          {error && <Notice error>{error}</Notice>}
          {profileRequired && (
            <Button secondary onClick={() => go("user-profile")}>
              Thiết lập hồ sơ
            </Button>
          )}
          {warnings.map((w, i) => (
            <Notice key={i}>{w}</Notice>
          ))}
          {!editing && !generated && (
            <State resource={resource} empty="Chưa có thực đơn đang dùng" />
          )}
          {testPlan && (
            <Notice error>
              Thực đơn này có món thử nghiệm và chưa thể sử dụng. Bạn có thể tạo
              thực đơn khác.
            </Notice>
          )}
          {!editing && !testPlan && plan?.days && (
            <>
              <div className="vp-section-heading">
                <h2>
                  {plan.startDate} – {plan.endDate}
                </h2>
                <span>{statusLabel(plan.status)}</span>
              </div>
              <div className="vp-actions">
                <Button
                  secondary
                  disabled={busy}
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
                <Button
                  secondary
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      try {
                        setShopping(
                          await request(`/meal-plans/${plan.id}/shopping-list`),
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
                    })
                  }
                >
                  Danh sách đi chợ
                </Button>
              </div>
              {plan.days.map((day) => (
                <article className="vp-day" key={day.date}>
                  <h3>
                    {new Date(day.date + "T12:00:00").toLocaleDateString(
                      "vi-VN",
                      { weekday: "long", day: "numeric", month: "numeric" },
                    )}
                    <small>{amount(day.total?.kcal)} kcal</small>
                  </h3>
                  {day.meals?.map((meal) => (
                    <div className="vp-meal" key={meal.id}>
                      <div>
                        <span className="vp-eyebrow">
                          {{
                            breakfast: "Bữa sáng",
                            lunch: "Bữa trưa",
                            dinner: "Bữa tối",
                            snack: "Bữa phụ",
                          }[meal.mealType] || meal.mealType}
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
                          disabled={busy}
                          aria-label={`Đổi ${meal.recipeTitle}`}
                          onClick={() => swap(meal)}
                        >
                          <RefreshCw size={17} />
                        </button>
                        <button
                          className="vp-icon"
                          disabled={busy}
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
                        </button>
                      </div>
                    </div>
                  ))}
                </article>
              ))}
              {shopping && (
                <section className="vp-panel">
                  <h2>Danh sách đi chợ</h2>
                  {listOf(shopping.items || shopping).map((item) => (
                    <label className="vp-check" key={item.id}>
                      <input
                        type="checkbox"
                        checked={!!item.isBought}
                        disabled={busy}
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
                </section>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}
