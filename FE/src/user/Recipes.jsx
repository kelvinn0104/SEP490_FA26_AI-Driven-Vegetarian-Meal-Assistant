import { useMemo, useState } from "react";
import {
  Search,
  X,
  ArrowRight,
  CalendarDays,
  MessageCircle,
  Users,
} from "lucide-react";
import { useResource, Button, State, Card, PageHeading } from "./ui";
import { listOf, categoryLabel, isTestContent } from "./data";
import { request } from "./api";
const normalize = (value = "") =>
  String(value ?? "").toLocaleLowerCase("vi-VN").normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d").trim();

export function Discover({ open, go, library = false }) {
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
  const recipes = resource.data;
  const index = useMemo(() => (recipes || []).map((recipe) => ({ recipe, name: normalize(recipe.title) })), [recipes]);
  const counts = useMemo(() => {
    const categories = new Map([["Tất cả", index.length]]);
    for (const { recipe } of index) {
      if (recipe.category) categories.set(recipe.category, (categories.get(recipe.category) || 0) + 1);
    }
    return categories;
  }, [index]);
  const search = normalize(query);
  const filtered = index.filter(({ recipe, name }) =>
    (category === "Tất cả" || recipe.category === category) && name.includes(search),
  ).map(({ recipe }) => recipe);
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
      {library ? (
        <PageHeading
          title="Khám phá món chay"
        >
          <div className="vp-discover-actions">
            <button className="vp-text-button" onClick={() => go("scan")}>
              Quét nguyên liệu
              <ArrowRight size={17} />
            </button>
            <button className="vp-text-button" onClick={() => go("planner")}>
              Lên thực đơn
              <ArrowRight size={17} />
            </button>
          </div>
        </PageHeading>
      ) : (
        <section className="vp-hero">
          <div>
            <span className="vp-eyebrow">Sổ tay bếp chay</span>
            <h1>
              Hôm nay <em>nấu gì?</em>
            </h1>
            <p>
              Tìm một món chay để nấu hôm nay, hoặc lên thực đơn cho những ngày tới.
            </p>
            <form
              className="vp-hero-search"
              onSubmit={(event) => {
                event.preventDefault();
                document
                  .getElementById("recipes")
                  ?.scrollIntoView({ block: "start" });
                document
                  .querySelector("#recipes input")
                  ?.focus({ preventScroll: true });
              }}
            >
              <Search size={20} aria-hidden="true" />
              <input
                aria-label="Hôm nay bạn muốn nấu gì?"
                placeholder="Hôm nay bạn muốn nấu gì?"
                value={query}
                onChange={change(setQuery)}
              />
              <button aria-label="Tìm món trong thư viện" type="submit">
                <ArrowRight size={20} />
              </button>
            </form>
            <div className="vp-hero-signature">
              <Button onClick={() => go("planner")}>
                Lên thực đơn
                <ArrowRight size={17} />
              </Button>
              <button onClick={() => go("chatbot")}>
                <MessageCircle size={17} />
                Hỏi trợ lý
              </button>
            </div>
          </div>
          <div className="vp-hero-photo">
            <figure className="vp-hero-still-life">
              <img
                src="/images/brand/veggie-kitchen.webp"
                alt="Bữa chay với đậu hũ, cơm và rau củ — hình minh họa"
                width="960"
                height="960"
                fetchPriority="high"
              />
              <figcaption>Hình minh họa bếp chay</figcaption>
            </figure>
          </div>
        </section>
      )}
      <section id="recipes" className="vp-library">
          <div className="vp-section-heading">
            <div>
              <h2>{library ? "Thư viện công thức" : "Công thức chay"}</h2>
            </div>
            <p role="status">
              {resource.loading
                ? "Đang tải thư viện…"
                : resource.error
                  ? "Chưa tải được thư viện"
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
          {[...counts].map(([c, count]) => (
            <button
              key={c}
              aria-pressed={category === c}
              onClick={() => {
                setCategory(c);
                setPage(1);
              }}
            >
              {categoryLabel(c)}
              <span className="vp-category-count">{count}</span>
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
                  setSort("default");
                  setPage(1);
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </State>
      </section>
      {!library && <section className="vp-tools" aria-label="Công cụ bếp">
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
        <div>
          <Users size={24} />
          <h3>Chuyện từ căn bếp</h3>
          <button onClick={() => go("community")}>
            Ghé cộng đồng
            <ArrowRight size={16} />
          </button>
        </div>
      </section>}
    </>
  );
}
