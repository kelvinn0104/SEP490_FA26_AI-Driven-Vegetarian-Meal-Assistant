import { useState, useEffect, useRef } from "react";
import { Camera, Check, ScanLine, ArrowUpRight } from "lucide-react";
import { AiActivity } from "./AiActivity";
import { Button, Notice, PageHeading, RecipeSuggestions } from "./ui";
import { amount, mealLabels, userError, validatePhoto, isTestContent } from "./data";
import { request } from "./api";
export function Vision({ open, flash, go }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(null);
  const lock = useRef(false);
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const choose = (e) => {
    const next = e.target.files?.[0];
    e.target.value = "";
    if (!next) return;
    const message = validatePhoto(next);
    setError(message);
    if (message) return;
    setResult(null);
    setConfirmed(false);
    setFile(next);
  };
  const scan = async () => {
    if (!file || lock.current) return;
    lock.current = true;
    setBusy("scan");
    setError("");
    try {
      const form = new FormData();
      form.append("Image", file);
      const data = await request("/scans", form);
      if (!data?.scanId || !Array.isArray(data.detectedItems))
        throw new Error(
          "Chưa nhận được kết quả nhận diện hợp lệ. Vui lòng thử lại.",
        );
      setResult(data);
      setConfirmed(false);
      setSelected(
        data.detectedItems
          .filter((i) => canUseIngredient(i) && (i.confidence == null || i.confidence >= 0.4))
          .map((i) => i.ingredientId),
      );
    } catch (e) {
      setError(userError(e));
    } finally {
      lock.current = false;
      setBusy(null);
    }
  };
  const confirm = async () => {
    if (lock.current || !result?.scanId || !selected.length) return;
    lock.current = true;
    setBusy("confirm");
    setError("");
    try {
      const next = await request(`/scans/${result.scanId}/confirm`, {
        ingredientIds: [...new Set(selected)],
      });
      if (!next?.scanId || !Array.isArray(next.detectedItems))
        throw new Error("Chưa nhận được kết quả xác nhận hợp lệ.");
      setResult(next);
      setConfirmed(true);
      flash("Đã xác nhận nguyên liệu.");
    } catch (e) {
      setError(userError(e));
    } finally {
      lock.current = false;
      setBusy(null);
    }
  };
  const suggestions = (result?.suggestedRecipes || []).filter(
    (recipe) => !isTestContent(recipe),
  );
  const menu = (result?.suggestedMenu?.meals || []).filter(
    (meal) => meal.recipeId && !isTestContent({ title: meal.recipeTitle }),
  );
  const canConfirm = result?.detectedItems.some(canUseIngredient);
  const showSuggestions = result && (confirmed || !canConfirm);
  return (
    <>
      <PageHeading title="Quét nguyên liệu" />
      <ol className="vp-scan-flow" aria-label="Các bước quét nguyên liệu">
        <li
          className={result ? "done" : "current"}
          aria-current={!result ? "step" : undefined}
        >
          <span>{file ? <Check size={16} /> : "01"}</span>Chọn ảnh
        </li>
        <li
          className={showSuggestions ? "done" : result ? "current" : ""}
          aria-current={result && !showSuggestions ? "step" : undefined}
        >
          <span>{showSuggestions ? <Check size={16} /> : "02"}</span>Kiểm tra nguyên
          liệu
        </li>
        <li
          className={showSuggestions ? "current" : ""}
          aria-current={showSuggestions ? "step" : undefined}
        >
          <span>03</span>Tìm món
        </li>
      </ol>
      <div className="vp-two-columns vp-scan-layout">
        <section className="vp-panel vp-scan-input">
          <h2>Ảnh nguyên liệu</h2>
          <p>Chụp đủ sáng để thấy rõ từng nguyên liệu.</p>
          {preview && (
            <div
              className={`vp-scan-image ${busy === "scan" ? "is-scanning" : ""}`}
            >
              <img
                className="vp-scan-preview"
                src={preview}
                alt="Ảnh nguyên liệu đã chọn"
              />
              <ScanLine className="vp-scan-frame" aria-hidden="true" />
              {busy === "scan" && (
                <span className="vp-scan-line" aria-hidden="true" />
              )}
            </div>
          )}
          {!preview && (
            <figure className="vp-pantry-illustration">
              <img
                src="/images/brand/pantry-light.webp"
                alt=""
                width="900"
                height="600"
              />
              <figcaption>Ảnh minh họa</figcaption>
            </figure>
          )}
          <label className={`vp-upload ${preview ? "has-preview" : ""}`}>
            <Camera size={30} />
            <span>{preview ? "Đổi ảnh" : "Chọn ảnh từ thiết bị"}</span>
            {!preview && <small>JPG, PNG, WebP · tối đa 8 MB</small>}
            <input
              disabled={busy}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={choose}
            />
          </label>
          {error && <Notice error>{error}</Notice>}
          <Button disabled={!file || busy} onClick={scan}>
            {busy === "scan" ? "Đang nhận diện…" : "Nhận diện nguyên liệu"}
          </Button>
          {busy === "scan" && <AiActivity kind="scan" />}
        </section>
        <section
          className={`vp-panel vp-scan-review ${result ? "has-result" : ""}`}
        >
          <h2>Kiểm tra nguyên liệu</h2>
          {!result ? (
            <div className="vp-scan-waiting">
              <img
                src="/images/brand/basil-sprout.webp"
                alt=""
                width="92"
                height="92"
              />
                <h3>Kiểm tra trước khi chọn món</h3>
                <p>Sau khi quét, bạn có thể bỏ những nguyên liệu nhận diện sai.</p>
            </div>
          ) : (
            <>
              {result.message && <Notice>{result.message}</Notice>}
              {result.dishName && (
                <div className="vp-scan-dish">
                  <span className="vp-eyebrow">
                    {result.imageType === "mixed"
                      ? "Món ăn và nguyên liệu"
                      : "Món ăn nhận diện được"}
                  </span>
                  <h3>{result.dishName}</h3>
                  {result.dishDescription && <p>{result.dishDescription}</p>}
                  {result.estimatedDishNutrition && (
                    <>
                      <p>Ước tính một phần từ ảnh</p>
                      <dl className="vp-scan-metrics">
                        {[["Năng lượng", "kcal", "kcal"], ["Đạm", "proteinG", "g"], ["Tinh bột", "carbG", "g"], ["Chất béo", "fatG", "g"]].map(([label, key, unit]) => (
                          <div key={key}><dt>{label}</dt><dd>{amount(result.estimatedDishNutrition[key])} <small>{unit}</small></dd></div>
                        ))}
                      </dl>
                    </>
                  )}
                </div>
              )}
              {!result.detectedItems?.length && !result.dishName && (
                <Notice>
                  Chưa nhận diện được nguyên liệu. Thử ảnh rõ và đủ sáng hơn.
                </Notice>
              )}
              <div className="vp-detected-items">
                {result.detectedItems?.map((item, i) => (
                  <label key={i} className="vp-check">
                    <input
                      type="checkbox"
                      disabled={!canUseIngredient(item) || !!busy}
                      checked={selected.includes(item.ingredientId)}
                      onChange={(e) => {
                        setConfirmed(false);
                        setSelected((prev) =>
                          e.target.checked
                            ? [...prev, item.ingredientId]
                            : prev.filter((id) => id !== item.ingredientId),
                        );
                      }}
                    />
                    {item.nameVi || item.name}
                    {!canUseIngredient(item) && (
                      <small>
                        {item.isVegetarian === false
                          ? "Không phải đồ chay"
                          : item.freshness === "spoiled"
                            ? "Có dấu hiệu hỏng"
                            : "Chưa có trong danh mục"}
                      </small>
                    )}
                  </label>
                ))}
              </div>
              {canConfirm && <Button
                disabled={
                  busy || confirmed || !selected.length || !result.scanId
                }
                onClick={confirm}
              >
                {confirmed
                  ? "Đã xác nhận nguyên liệu"
                  : busy === "confirm"
                    ? "Đang xác nhận…"
                    : "Xác nhận nguyên liệu"}
              </Button>}
              <p>
                Nhận diện chỉ mang tính gợi ý, không xác nhận thực phẩm an toàn
                để ăn.
              </p>
              {showSuggestions && <>
                {suggestions.length > 0 && <h3 className="vp-result-heading">Món có thể nấu</h3>}
                <RecipeSuggestions recipes={suggestions} open={open} />
                {menu.length > 0 && (
                  <section className="vp-scan-menu">
                    <h3>Gợi ý bữa ăn trong ngày</h3>
                    {result.suggestedMenu.notes && <p>{result.suggestedMenu.notes}</p>}
                    <ul className="vp-suggestions">
                      {menu.map((meal) => (
                        <li key={`${meal.mealType}:${meal.recipeId}`}>
                          <button onClick={() => open(meal.recipeId)}>
                            <span><small>{mealLabels[meal.mealType] || meal.mealType} · {amount(meal.nutrition?.kcal)} kcal</small><strong>{meal.recipeTitle}</strong></span>
                            <ArrowUpRight size={17} aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {!suggestions.length && !menu.length && <p>Chưa có món gợi ý từ lần quét này.</p>}
                {confirmed && <Button secondary onClick={() => go("create-plan", result.scanId)}>Lên thực đơn từ nguyên liệu <ArrowUpRight size={17} /></Button>}
              </>}
            </>
          )}
        </section>
      </div>
    </>
  );
}

function canUseIngredient(item) {
  return item.ingredientId != null && item.freshness !== "spoiled" && item.isVegetarian !== false;
}
