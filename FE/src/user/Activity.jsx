import { BookmarkMinus, CookingPot, Utensils, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import {
  useResource,
  Button,
  State,
  Notice,
  PageHeading,
  RecipeImage,
  PageControls,
  NutrientMeter,
  EnergyGauge,
} from "./ui";
import {
  amount,
  listOf,
  userError,
  isTestContent,
  vietnamDate,
  safeImage,
} from "./data";
import { request } from "./api";
export function Collection({ open, flash, go }) {
  const [page, setPage] = useState(1);
  const resource = useResource(
    () => request(`/recipes/favorites?page=${page}&pageSize=12`),
    [page],
  );
  const [busy, setBusy] = useState(null);
  const recipes = listOf(resource.data).filter(
    (recipe) => !isTestContent(recipe),
  );
  const remove = async (id) => {
    setBusy(id);
    try {
      await request(
        `/recipes/${encodeURIComponent(id)}/favorite`,
        undefined,
        "DELETE",
      );
      resource.reload();
      flash("Đã bỏ lưu món.");
    } catch (e) {
      flash(userError(e));
    } finally {
      setBusy(null);
    }
  };
  return (
    <>
      <PageHeading eyebrow="Một góc dành cho món bạn thích" title="Món đã lưu">
        <Button secondary onClick={() => go("discover")}>
          Khám phá thêm
        </Button>
      </PageHeading>
      <State
        resource={
          resource.loading || resource.error
            ? resource
            : { ...resource, data: recipes }
        }
        empty="Bạn chưa lưu món nào"
        emptyAction={
          <Button onClick={() => go("discover")}>Tìm một món muốn nấu</Button>
        }
      >
        <div className="vp-saved-list">
          {recipes.map((recipe) => (
            <article className="vp-saved-recipe" key={recipe.id}>
              <div className="vp-saved-thumb">
                {safeImage(recipe.imageUrl || recipe.image) ? (
                  <RecipeImage recipe={recipe} />
                ) : (
                  <CookingPot size={24} aria-hidden="true" />
                )}
              </div>
              <div>
                <h2>
                  <button
                    className="vp-text-button"
                    onClick={() => open(recipe.id)}
                  >
                    {recipe.title}
                  </button>
                </h2>
                <small>{amount(recipe.kcalPerServing)} kcal / khẩu phần</small>
              </div>
              <button
                className="vp-icon"
                disabled={busy != null}
                onClick={() => remove(recipe.id)}
                aria-label={`Bỏ lưu món ${recipe.title}`}
              >
                <BookmarkMinus size={19} />
              </button>
            </article>
          ))}
        </div>
      </State>
      <PageControls
        data={resource.data}
        page={page}
        setPage={setPage}
        disabled={resource.loading}
      />
    </>
  );
}
export function Nutrition() {
  const [date, setDate] = useState(vietnamDate());
  const resource = useResource(
    () => request(`/nutrition/daily?date=${date}`),
    [date],
  );
  const data = resource.data;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState({ steps: "", kcalBurned: "" });
  useEffect(() => {
    if (data)
      setActivity({
        steps: data.steps ?? "",
        kcalBurned: data.kcalBurned ?? "",
      });
  }, [data]);
  const act = async (fn) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await fn();
      resource.reload();
    } catch (e) {
      setError(userError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading title="Nhật ký dinh dưỡng">
        <label>
          Ngày
          <input
            aria-label="Ngày nhật ký"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
      </PageHeading>
      {error && <Notice error>{error}</Notice>}
      <State resource={resource}>
        {data && (
          <>
            <section className="vp-panel vp-nutrition-overview">
              <h2>Dinh dưỡng trong ngày</h2>
              <div className="vp-nutrition-summary">
                <EnergyGauge
                  value={data.consumed?.kcal}
                  target={data.target?.kcal}
                />
                <div className="vp-daily-totals">
                  {[
                    ["Đạm", "proteinG", "g"],
                    ["Chất béo", "fatG", "g"],
                    ["Tinh bột", "carbG", "g"],
                  ].map(([label, key, unit]) => (
                    <NutrientMeter
                      key={key}
                      label={label}
                      value={data.consumed?.[key]}
                      target={data.target?.[key]}
                      unit={unit}
                    />
                  ))}
                </div>
              </div>
              <details className="vp-nutrition-micros">
                <summary>Vi chất trong ngày</summary>
                <div className="vp-daily-totals">
                  <NutrientMeter
                    label="Sắt"
                    value={data.consumed?.ironMg}
                    target={data.target?.ironMg}
                    unit="mg"
                  />
                  <NutrientMeter
                    label="Vitamin B12"
                    value={data.consumed?.b12Mcg}
                    target={data.target?.b12Mcg}
                    unit="µg"
                  />
                </div>
              </details>
              {data.alerts?.map((a, i) => (
                <Notice key={i}>{a.message}</Notice>
              ))}
            </section>
            <div className="vp-two-columns" style={{ marginTop: 24 }}>
              <section className="vp-panel vp-meal-log">
                <h2>Bữa đã ghi nhận</h2>
                {data.logs?.length ? (
                  data.logs.map((log) => (
                    <article className="vp-log-entry" key={log.id}>
                      <span className="vp-log-icon">
                        <Utensils size={18} aria-hidden="true" />
                      </span>
                      <div>
                        <h3>{log.recipeTitle}</h3>
                        <p>
                          {amount(log.servings)} khẩu phần ·{" "}
                          {amount(log.kcalConsumed)} kcal
                        </p>
                      </div>
                      <button
                        className="vp-text-button"
                        disabled={busy}
                        onClick={() =>
                          act(() =>
                            request(
                              `/nutrition/logs/${log.id}`,
                              undefined,
                              "DELETE",
                            ),
                          )
                        }
                      >
                        Bỏ ghi nhận
                      </button>
                    </article>
                  ))
                ) : (
                  <p>
                    Chưa có bữa ăn nào. Ghi nhận bữa đã ăn từ trang thực đơn.
                  </p>
                )}
              </section>
              <form
                className="vp-panel"
                onSubmit={(e) => {
                  e.preventDefault();
                  act(() =>
                    request(
                      "/nutrition/activity",
                      {
                        activityDate: date,
                        steps: Number(activity.steps),
                        kcalBurned: Number(activity.kcalBurned),
                      },
                      "PUT",
                    ),
                  );
                }}
              >
                <h2>Vận động</h2>
                <p>Nhập số liệu thực tế từ hoạt động của bạn.</p>
                <label>
                  Số bước
                  <input
                    type="number"
                    required
                    min="0"
                    max="200000"
                    value={activity.steps}
                    onChange={(e) =>
                      setActivity((p) => ({ ...p, steps: e.target.value }))
                    }
                  />
                </label>
                <label>
                  Năng lượng tiêu hao (kcal)
                  <input
                    type="number"
                    required
                    min="0"
                    max="10000"
                    step="0.1"
                    value={activity.kcalBurned}
                    onChange={(e) =>
                      setActivity((p) => ({ ...p, kcalBurned: e.target.value }))
                    }
                  />
                </label>
                <Button disabled={busy}>Lưu vận động</Button>
              </form>
            </div>
          </>
        )}
      </State>
    </>
  );
}
export function Notifications() {
  const [page, setPage] = useState(1);
  const resource = useResource(
    () => request(`/notifications?page.Page=${page}&page.PageSize=20`),
    [page],
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <>
      <PageHeading title="Thông báo">
        <Button
          secondary
          disabled={busy || !!resource.error || resource.loading}
          onClick={async () => {
            setBusy(true);
            try {
              await request("/notifications/read-all", undefined, "PATCH");
              resource.reload();
            } catch (e) {
              setError(userError(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </PageHeading>
      {error && <Notice error>{error}</Notice>}
      <State resource={resource}>
        {listOf(resource.data).length ? (
          listOf(resource.data).map((n) => (
            <article
              className={`vp-list-card ${n.isRead ? "is-read" : "is-unread"}`}
              key={n.id}
            >
              <h3>
                <Bell size={17} aria-hidden="true" />{" "}
                {n.title || "Thông báo VeggieAI"}
              </h3>
              <p>{n.content}</p>
              <small>{new Date(n.createdAt).toLocaleString("vi-VN")}</small>
              {!n.isRead && (
                <button
                  className="vp-text-button"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError("");
                    try {
                      await request(
                        `/notifications/${n.id}/read`,
                        undefined,
                        "PATCH",
                      );
                      resource.reload();
                    } catch (e) {
                      setError(userError(e));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </article>
          ))
        ) : (
          <p>Chưa có thông báo.</p>
        )}
      </State>
      <PageControls
        data={resource.data}
        page={page}
        setPage={setPage}
        disabled={resource.loading}
      />
    </>
  );
}
