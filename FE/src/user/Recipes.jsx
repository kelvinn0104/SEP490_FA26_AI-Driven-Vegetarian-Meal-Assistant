import { useState } from "react";
import {
  Search,
  X,
  ArrowRight,
  Camera,
  CalendarDays,
  MessageCircle,
  Users,
} from "lucide-react";
import { useResource, Button, State, Card, PageHeading } from "./ui";
import { listOf, categoryLabel, isTestContent } from "./data";
import { request } from "./api";
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
  const recipes = resource.data || [];
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
      {library ? (
        <PageHeading
          eyebrow="Một chút cảm hứng, mỗi ngày"
          title="Khám phá món chay"
        >
          <div className="vp-discover-actions">
            <small>
              {!resource.loading && !resource.error
                ? `${filtered.length} công thức`
                : "Thư viện món chay"}
            </small>
            <button className="vp-text-button" onClick={() => go("planner")}>
              Lên thực đơn
              <ArrowRight size={17} />
            </button>
          </div>
        </PageHeading>
      ) : (
        <section className="vp-hero">
          <div>
            <span className="vp-eyebrow">Bếp chay mỗi ngày</span>
            <h1>
              Ăn chay ngon.
              <br />
              Đổi vị mỗi ngày.
            </h1>
            <p>
              Tìm món hợp khẩu vị, lên thực đơn vừa nhu cầu. Bắt đầu từ những gì
              bạn thích.
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
            <Button onClick={() => go("discover")}>
              Khám phá món
              <ArrowRight size={18} />
            </Button>
            <div className="vp-hero-signature">
              <button onClick={() => go("planner")}>
                <CalendarDays size={17} />
                Lên thực đơn
              </button>
              <button onClick={() => go("vision")}>
                <Camera size={17} />
                Quét ảnh
              </button>
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
            <button className="vp-hero-scan" onClick={() => go("vision")}>
              <Camera size={23} />
              <span>
                <small>Từ nguyên liệu đang có</small>Quét ảnh, tìm món
              </span>
              <ArrowRight size={20} />
            </button>
            <button className="vp-hero-plan" onClick={() => go("planner")}>
              <CalendarDays size={24} />
              <span>
                Lên thực đơn<small>Chọn theo nhu cầu của bạn</small>
              </span>
              <ArrowRight size={20} />
            </button>
          </div>
        </section>
      )}
      <section id="recipes" className="vp-library">
        {!library && (
          <div className="vp-section-heading">
            <div>
              <span className="vp-eyebrow">Cảm hứng vào bếp</span>
              <h2>Công thức chay</h2>
            </div>
            <p>
              {resource.loading
                ? "Đang tải thư viện…"
                : resource.error
                  ? "Chưa tải được thư viện"
                  : `${filtered.length} công thức`}
            </p>
          </div>
        )}
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
        <div>
          <Users size={24} />
          <h3>Chuyện từ căn bếp</h3>
          <button onClick={() => go("community")}>
            Ghé cộng đồng
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </>
  );
}
