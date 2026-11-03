import { KitchenView } from "./KitchenView";
import { useState } from "react";
import {
  Search,
  CookingPot,
  RefreshCw,
  X,
  ArrowRight,
  Camera,
  CalendarDays,
  MessageCircle,
  ArrowLeft,
  Bookmark,
  Leaf,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useResource, Button, State, Card, RecipeImage } from "./ui";
import {
  amount,
  listOf,
  userError,
  categoryLabel,
  isTestContent,
} from "./data";
import { request } from "./api";
export function Discover({ open, go, user }) {
  const resource = useResource(
    async (signal) =>
      listOf(await request("/Recipes", undefined, undefined, signal)).filter(
        (r) =>
          (!r.status || r.status.toLowerCase() === "published") &&
          !isTestContent(r),
      ),
    [],
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tất cả");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const recipes = resource.data || [];
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const photographed = recipes.filter((r) => r.imageUrl);
  const featured = photographed.length
    ? photographed[featuredIndex % photographed.length]
    : recipes[0];
  const categories = [
    "Tất cả",
    ...new Set(recipes.map((r) => r.category).filter(Boolean)),
  ];
  const normalize = (value) =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .toLowerCase();
  const filtered = recipes.filter(
    (r) =>
      (category === "Tất cả" || r.category === category) &&
      normalize(r.title).includes(normalize(query)),
  );
  if (sort === "protein")
    filtered.sort((a, b) => (b.proteinG ?? -1) - (a.proteinG ?? -1));
  if (sort === "calories")
    filtered.sort(
      (a, b) => (a.kcalPerServing ?? Infinity) - (b.kcalPerServing ?? Infinity),
    );
  const change = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };
  return (
    <>
      <section className="vp-hero">
        <div>
          <span className="vp-eyebrow">Bếp chay mỗi ngày</span>
          <h1>
            Hôm nay,
            <br />
            nấu <em>gì chay?</em>
          </h1>
          <p>Tìm món ngon. Lên thực đơn dễ hơn.</p>
          <Button onClick={() => go("planner")}>
            {user ? "Thực đơn của tôi" : "Lên thực đơn"}
            <ArrowRight size={18} />
          </Button>
          <a className="vp-hero-link" href="#recipes">
            Khám phá công thức
          </a>
        </div>
        <div className="vp-hero-photo">
          {photographed.length > 1 && (
            <button
              type="button"
              className="vp-feature-next"
              onClick={() => setFeaturedIndex((i) => i + 1)}
              aria-label="Đổi gợi ý món ăn"
            >
              <RefreshCw size={15} />
              Đổi gợi ý
            </button>
          )}
          {featured ? (
            <>
              <RecipeImage key={featured.id} recipe={featured} priority />
              <button onClick={() => open(featured.id)}>
                <span>
                  <small>Gợi ý từ thư viện</small>
                  {featured.title}
                </span>
                <ArrowRight size={22} />
              </button>
            </>
          ) : (
            <div className="vp-hero-placeholder">
              <Leaf size={64} strokeWidth={1} />
              <span>Một chút xanh cho mỗi bữa ăn.</span>
            </div>
          )}
        </div>
      </section>
      <section id="recipes" className="vp-library">
        <div className="vp-section-heading">
          <div>
            <span className="vp-eyebrow">Cảm hứng vào bếp</span>
            <h2>Công thức chay</h2>
          </div>
          <p>
            {resource.loading
              ? "Đang tìm món ngon…"
              : `${filtered.length} công thức`}
          </p>
        </div>
        <div className="vp-toolbar">
          <label className="vp-search">
            <Search size={20} />
            <input
              aria-label="Tìm công thức"
              placeholder="Tìm tên món…"
              value={query}
              onChange={change(setQuery)}
            />
            {query && (
              <button
                aria-label="Xóa tìm kiếm"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
              >
                <X size={17} />
              </button>
            )}
          </label>
          <select
            aria-label="Sắp xếp công thức"
            value={sort}
            onChange={change(setSort)}
          >
            <option value="default">Thứ tự thư viện</option>
            <option value="protein">Nhiều đạm trước</option>
            <option value="calories">Ít kcal trước</option>
          </select>
        </div>
        <div className="vp-chips" aria-label="Danh mục">
          {categories.map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => {
                setCategory(c);
                setPage(1);
              }}
            >
              {categoryLabel(c)}
              <span className="vp-category-count">
                {c === "Tất cả"
                  ? recipes.length
                  : recipes.filter((r) => r.category === c).length}
              </span>
            </button>
          ))}
        </div>
        <State resource={resource}>
          {filtered.length ? (
            <>
              <div className="vp-grid">
                {filtered.slice(0, page * 12).map((recipe) => (
                  <Card key={recipe.id} recipe={recipe} open={open} />
                ))}
              </div>
              {filtered.length > page * 12 && (
                <div className="vp-load-more">
                  <Button secondary onClick={() => setPage((p) => p + 1)}>
                    Xem thêm công thức
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="vp-empty">
              <Search size={28} />
              <h3>Chưa tìm thấy món phù hợp</h3>
              <p>Thử tên món khác hoặc bỏ bộ lọc.</p>
              <Button
                secondary
                onClick={() => {
                  setQuery("");
                  setCategory("Tất cả");
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </State>
      </section>
      <section className="vp-tools">
        <div>
          <Camera size={24} />
          <h3>Có gì trong tủ lạnh?</h3>
          <button onClick={() => go("vision")}>
            Nhận diện nguyên liệu <ArrowRight size={16} />
          </button>
        </div>
        <div>
          <CalendarDays size={24} />
          <h3>Bớt nghĩ mỗi bữa</h3>
          <button onClick={() => go("planner")}>
            Tạo thực đơn <ArrowRight size={16} />
          </button>
        </div>
        <div>
          <MessageCircle size={24} />
          <h3>Một chút gợi ý</h3>
          <button onClick={() => go("chatbot")}>
            Bắt đầu trò chuyện <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </>
  );
}
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
      <button className="vp-back" onClick={() => go("home")}>
        <ArrowLeft size={17} />
        Công thức chay
      </button>
      <State resource={resource}>
        {recipe && (
          <>
            <div className="vp-detail-top">
              <div>
                <span className="vp-eyebrow">
                  {categoryLabel(recipe.category) || "Công thức chay"}
                </span>
                <h1>{recipe.title}</h1>
                <p>Công thức từ thư viện VeggieAI</p>
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
              <RecipeImage recipe={recipe} />
            </div>
            <div className="vp-detail-columns">
              <section>
                <h2>Cách làm</h2>
                {recipe.instructions ? (
                  <div className="vp-prose">
                    <ReactMarkdown>{recipe.instructions}</ReactMarkdown>
                  </div>
                ) : (
                  <p>Chưa có hướng dẫn cho công thức này.</p>
                )}
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
              </section>
              <aside className="vp-panel">
                <h2>Dinh dưỡng</h2>
                <p>Tổng theo số khẩu phần đã chọn.</p>
                <label>
                  Số khẩu phần
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={servings || base}
                    onChange={(e) =>
                      setServings(
                        Math.max(1, Math.min(20, Number(e.target.value) || 1)),
                      )
                    }
                  />
                </label>
                <dl className="vp-nutrients">
                  {nutrients.map(([label, value, unit]) => (
                    <div key={label}>
                      <dt>{label}</dt>
                      <dd>
                        {amount(value, servings || base)} <small>{unit}</small>
                      </dd>
                    </div>
                  ))}
                </dl>
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
