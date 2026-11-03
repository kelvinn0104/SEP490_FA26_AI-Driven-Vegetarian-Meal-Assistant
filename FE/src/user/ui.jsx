import { useEffect, useState } from "react";
import { Leaf, RefreshCw } from "lucide-react";
import { safeImage, userError, amount, categoryLabel } from "./data";
export function useResource(loader, dependencies = []) {
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null,
  });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    setState({ loading: true, data: null, error: null });
    Promise.resolve()
      .then(() => loader(controller.signal))
      .then((data) => {
        if (active) setState({ loading: false, data, error: null });
      })
      .catch((error) => {
        if (active) setState({ loading: false, data: null, error });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [...dependencies, revision]);
  return { ...state, reload: () => setRevision((n) => n + 1) };
}
export function Button({ children, secondary, ...props }) {
  return (
    <button className={`vp-button ${secondary ? "secondary" : ""}`} {...props}>
      {children}
    </button>
  );
}
export function Notice({ children, error }) {
  return (
    <div
      className={`vp-notice ${error ? "error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function State({ resource, children, empty = "Chưa có dữ liệu." }) {
  if (resource.loading)
    return (
      <div className="vp-loading" role="status">
        <span className="vp-spinner" />
        Đang tải… <small>Có thể mất thêm một chút thời gian.</small>
      </div>
    );
  if (resource.error)
    return (
      <div className="vp-empty">
        <h2>Chưa thể tải nội dung</h2>
        <p role="alert">{userError(resource.error)}</p>
        <Button secondary onClick={resource.reload}>
          <RefreshCw size={16} />
          Thử lại
        </Button>
      </div>
    );
  if (
    resource.data == null ||
    (Array.isArray(resource.data) && !resource.data.length) ||
    (Array.isArray(resource.data?.items) && !resource.data.items.length)
  )
    return (
      <div className="vp-empty">
        <Leaf size={32} />
        <h2>{empty}</h2>
      </div>
    );
  return children;
}
export function RecipeImage({ recipe, priority = false, ...props }) {
  const [failed, setFailed] = useState(false);
  const src = safeImage(recipe.imageUrl || recipe.image);
  return src && !failed ? (
    <img
      {...props}
      src={src}
      alt={recipe.title || "Món chay"}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setFailed(true)}
    />
  ) : (
    <div
      className="vp-image-placeholder"
      role="img"
      aria-label={`Chưa có ảnh: ${recipe.title || "món ăn"}`}
    >
      <span className="vp-placeholder-plate" aria-hidden="true">
        <Leaf size={30} strokeWidth={1.1} />
      </span>
      <small>Chưa có ảnh</small>
    </div>
  );
}
export function Card({ recipe, open }) {
  return (
    <article
      className="vp-recipe"
      data-tone={Number(recipe.categoryId || 0) % 3}
    >
      <button
        className="vp-card-image"
        onClick={() => open(recipe.id)}
        aria-label={`Xem ${recipe.title}`}
      >
        <RecipeImage recipe={recipe} />
      </button>
      <div className="vp-card-body">
        <span className="vp-eyebrow">
          {categoryLabel(recipe.category) || "Công thức chay"}
        </span>
        <h3>
          <button title={recipe.title} onClick={() => open(recipe.id)}>
            {recipe.title}
          </button>
        </h3>
        <p>
          {amount(recipe.kcalPerServing)} kcal <span>·</span>{" "}
          {amount(recipe.proteinG)} g đạm <small>/ khẩu phần</small>
        </p>
      </div>
    </article>
  );
}

export function PageHeading({ eyebrow, title, children }) {
  return (
    <div className="vp-page-heading">
      <div>
        {eyebrow && <span className="vp-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function PageControls({ data, page, setPage, disabled }) {
  if (!data?.totalPages || data.totalPages < 2) return null;
  return (
    <nav className="vp-pagination" aria-label="Phân trang">
      <Button
        secondary
        disabled={disabled || page <= 1}
        onClick={() => setPage((p) => p - 1)}
      >
        Trang trước
      </Button>
      <span>
        Trang {page} / {data.totalPages}
      </span>
      <Button
        secondary
        disabled={disabled || page >= data.totalPages}
        onClick={() => setPage((p) => p + 1)}
      >
        Trang sau
      </Button>
    </nav>
  );
}
