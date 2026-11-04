import { useEffect, useState, useRef, useId } from "react";
import { Leaf, RefreshCw, X, ArrowUpRight } from "lucide-react";
import {
  safeImage,
  userError,
  amount,
  categoryLabel,
  nutrientProgress,
} from "./data";
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
export function State({
  resource,
  children,
  empty = "Chưa có dữ liệu.",
  emptyAction,
}) {
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
        {emptyAction}
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
  const hasImage = !!safeImage(recipe.imageUrl || recipe.image);
  return (
    <article
      className={`vp-recipe ${hasImage ? "has-image" : "text-first"}`}
      data-tone={Number(recipe.categoryId || 0) % 3}
    >
      {hasImage ? (
        <button
          className="vp-card-image"
          onClick={() => open(recipe.id)}
          aria-label={`Xem ${recipe.title}`}
        >
          <RecipeImage recipe={recipe} />
        </button>
      ) : (
        <div className="vp-recipe-letter" aria-hidden="true">
          <Leaf size={24} strokeWidth={1.2} />
          <span>{categoryLabel(recipe.category) || "Bếp chay"}</span>
        </div>
      )}
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
        <button
          className="vp-recipe-open"
          onClick={() => open(recipe.id)}
          aria-label={`Xem công thức ${recipe.title}`}
        >
          <span>Xem công thức</span>
          <ArrowUpRight size={18} />
        </button>
      </div>
    </article>
  );
}

export function NutrientMeter({ label, value, target, unit }) {
  const progress = nutrientProgress(value, target);
  return (
    <div className="vp-nutrient-meter">
      <div>
        <span>{label}</span>
        <strong>
          {amount(value)} <small>{unit}</small>
        </strong>
      </div>
      {progress != null ? (
        <>
          <progress
            value={progress}
            max="100"
            aria-label={`${label} so với mục tiêu`}
          />
          <small>
            Mục tiêu {amount(target)} {unit}
          </small>
        </>
      ) : (
        <small>
          {target == null || Number(target) <= 0
            ? "Chưa có mục tiêu"
            : "Chưa có số liệu ghi nhận"}
        </small>
      )}
    </div>
  );
}

export function EnergyGauge({ value, target }) {
  const progress = nutrientProgress(value, target);
  return (
    <div className="vp-energy-gauge">
      <svg viewBox="0 0 240 140" aria-hidden="true">
        <path
          d="M25 119a95 95 0 0 1 190 0"
          fill="none"
          stroke="var(--line)"
          strokeWidth="18"
          strokeLinecap="round"
        />
        {progress != null && progress > 0 && (
          <path
            d="M25 119a95 95 0 0 1 190 0"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="18"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray={`${progress} 100`}
          />
        )}
      </svg>
      <div>
        <span>Năng lượng đã ghi nhận</span>
        <strong>
          {amount(value)} <small>kcal</small>
        </strong>
        <small>
          {target != null && Number(target) > 0
            ? `Mục tiêu ${amount(target)} kcal`
            : "Chưa có mục tiêu"}
        </small>
      </div>
    </div>
  );
}

export function Dialog({
  title,
  children,
  close,
  busy = false,
  className = "",
  heading = true,
}) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const element = ref.current;
    const trigger = document.activeElement;
    const previous = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previous;
      if (trigger?.isConnected && !trigger.disabled)
        trigger.focus({ preventScroll: true });
    };
  }, []);
  useEffect(() => {
    const element = ref.current;
    if (
      element?.open &&
      (!element.contains(document.activeElement) ||
        document.activeElement === element)
    ) {
      const first = [
        ...element.querySelectorAll(
          "button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled])",
        ),
      ].find((node) => node.getClientRects().length);
      (first || element).focus({ preventScroll: true });
    }
  }, [busy]);
  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      className={`vp-dialog ${className}`}
      aria-labelledby={heading ? titleId : undefined}
      aria-label={!heading ? title : undefined}
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const nodes = [
          ...e.currentTarget.querySelectorAll(
            'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
          ),
        ].filter((element) => element.getClientRects().length);
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (!first) {
          e.preventDefault();
          e.currentTarget.focus();
        } else if (
          (e.shiftKey && document.activeElement === first) ||
          (!e.shiftKey && document.activeElement === last) ||
          !e.currentTarget.contains(document.activeElement)
        ) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) close();
      }}
      onClick={(e) => {
        if (e.target !== e.currentTarget || busy) return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (
          e.clientX < rect.left ||
          e.clientX > rect.right ||
          e.clientY < rect.top ||
          e.clientY > rect.bottom
        )
          close();
      }}
    >
      {heading && (
        <header className="vp-dialog-heading">
          <h2 id={titleId}>{title}</h2>
          <button
            type="button"
            className="vp-icon"
            disabled={busy}
            aria-label="Đóng hộp thoại"
            onClick={close}
          >
            <X size={20} />
          </button>
        </header>
      )}
      {children}
    </dialog>
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
