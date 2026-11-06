import { useState } from "react";
import { CookingPot, Bookmark, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { KitchenView } from "./KitchenView";
import { useResource, Button, State, RecipeImage } from "./ui";
import { amount, userError, categoryLabel, isTestContent } from "./data";
import { request } from "./api";
export function RecipeDetail({ id, go, user, flash }) {
  const resource = useResource(
    (signal) =>
      id
        ? request(
            `/Recipes/${encodeURIComponent(id)}`,
            undefined,
            undefined,
            signal,
          ).then((recipe) => {
            if (isTestContent(recipe) || recipe?.status !== "published")
              throw new Error("Công thức này chưa sẵn sàng.");
            return recipe;
          })
        : Promise.reject(new Error("Liên kết thiếu mã công thức.")),
    [id],
  );
  const [servings, setServings] = useState(null);
  const [cooking, setCooking] = useState(false);
  const [saving, setSaving] = useState(false);
  const recipe = resource.data;
  const base = Number(recipe?.servings) || 1;
  const factor = (servings || base) / base;
  const save = async () => {
    if (!user) return go("login");
    setSaving(true);
    try {
      await request(`/recipes/${encodeURIComponent(id)}/favorite`, {}, "POST");
      flash("Đã lưu món vào bộ sưu tập.");
    } catch (e) {
      flash(userError(e));
    } finally {
      setSaving(false);
    }
  };
  const nutrients = [
    ["Năng lượng", recipe?.kcalPerServing, "kcal"],
    ["Đạm", recipe?.proteinG, "g"],
    ["Tinh bột", recipe?.carbG, "g"],
    ["Chất béo", recipe?.fatG, "g"],
    ["Sắt", recipe?.ironMg, "mg"],
    ["Vitamin B12", recipe?.b12Mcg, "µg"],
    ["Canxi", recipe?.calciumMg, "mg"],
    ["Kẽm", recipe?.zincMg, "mg"],
  ];
  return (
    <div className="vp-detail">
      <button className="vp-back" onClick={() => go("discover")}>
        <ArrowLeft size={17} />
        Công thức chay
      </button>
      <State resource={resource}>
        {recipe && (
          <>
            <div className="vp-detail-top">
              <RecipeImage key={id} recipe={recipe} priority />
              <div>
                <span className="vp-eyebrow">
                  {categoryLabel(recipe.category) || "Công thức chay"}
                </span>
                <h1>{recipe.title}</h1>
                {recipe.description && <p>{recipe.description}</p>}
                <div className="vp-recipe-facts">
                  <label className="vp-recipe-portions">
                    Số khẩu phần
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={servings || base}
                      onChange={(e) =>
                        setServings(
                          Math.max(
                            1,
                            Math.min(20, Number(e.target.value) || 1),
                          ),
                        )
                      }
                    />
                  </label>

                  <div>
                    <small>Mỗi khẩu phần</small>
                    <strong>
                      {amount(recipe.kcalPerServing)} <small>kcal</small>
                    </strong>
                  </div>
                </div>
                <div className="vp-actions">
                  <Button
                    onClick={() => setCooking(true)}
                    disabled={!recipe.instructions}
                  >
                    <CookingPot size={18} />
                    Vào bếp
                  </Button>
                  <Button secondary disabled={saving} onClick={save}>
                    <Bookmark size={17} />
                    {saving ? "Đang lưu…" : "Lưu món"}
                  </Button>
                </div>
              </div>
            </div>
            <div className="vp-detail-columns">
              <section>
                <h2>Nguyên liệu</h2>
                {recipe.ingredients?.length ? (
                  <ul className="vp-ingredient-list">
                    {recipe.ingredients.map((item, i) => (
                      <li key={i}>
                        {item.name || item.ingredientName}
                        <span>
                          {amount(item.quantityG ?? item.quantity, factor)}{" "}
                          {item.unit || "g"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    Định lượng nguyên liệu chưa được cung cấp. Không tự điều
                    chỉnh nguyên liệu theo số khẩu phần.
                  </p>
                )}
                <h2>Cách làm</h2>
                {recipe.instructions ? (
                  <div className="vp-prose">
                    <ReactMarkdown>{recipe.instructions}</ReactMarkdown>
                  </div>
                ) : (
                  <p>Chưa có hướng dẫn cho công thức này.</p>
                )}
              </section>
              <aside className="vp-panel">
                <h2>Dinh dưỡng</h2>
                <p>Tổng theo số khẩu phần đã chọn.</p>
                <dl className="vp-nutrients">
                  {nutrients.slice(0, 4).map(([label, value, unit]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>
                        {amount(value, servings || base)} <small>{unit}</small>
                      </dd>
                    </div>
                  ))}
                </dl>
                <details className="vp-micronutrients">
                  <summary>Xem vi chất</summary>
                  <dl className="vp-nutrients">
                    {nutrients.slice(4).map(([label, value, unit]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>
                          {amount(value, servings || base)}{" "}
                          <small>{unit}</small>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </details>
                <small>
                  Dấu — nghĩa là chưa có dữ liệu. Kiểm tra nguyên liệu và dị ứng
                  của bạn trước khi nấu.
                </small>
              </aside>
            </div>
          </>
        )}
      </State>
      {cooking && recipe && (
        <KitchenView
          recipe={recipe}
          servings={servings || base}
          onClose={() => setCooking(false)}
        />
      )}
    </div>
  );
}
