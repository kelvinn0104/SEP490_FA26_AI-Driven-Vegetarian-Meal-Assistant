import { useState, useEffect, useRef } from "react";
import { Camera, Check, ScanLine } from "lucide-react";
import { AiActivity } from "./AiActivity";
import { Button, Notice, PageHeading, Card } from "./ui";
import { userError, validatePhoto, isTestContent } from "./data";
import { request } from "./api";
export function Vision({ open, flash }) {
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
    setResult(null);
    setConfirmed(false);
    const message = validatePhoto(next);
    setError(message);
    setFile(message ? null : next);
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
        (data?.detectedItems || [])
          .filter((i) => i.ingredientId != null)
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
        ingredientIds: selected,
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
  return (
    <>
      <PageHeading
        title="Quét nguyên liệu"
        eyebrow="Từ nguyên liệu đến bữa ăn"
      />
      <ol className="vp-scan-flow" aria-label="Các bước quét nguyên liệu">
        <li
          className={result ? "done" : "current"}
          aria-current={!result ? "step" : undefined}
        >
          <span>{file ? <Check size={16} /> : "01"}</span>Chọn ảnh
        </li>
        <li
          className={confirmed ? "done" : result ? "current" : ""}
          aria-current={result && !confirmed ? "step" : undefined}
        >
          <span>{confirmed ? <Check size={16} /> : "02"}</span>Kiểm tra nguyên
          liệu
        </li>
        <li
          className={confirmed ? "current" : ""}
          aria-current={confirmed ? "step" : undefined}
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
              <h3>Từ nguyên liệu đến ý tưởng</h3>
              <p>Kết quả và gợi ý món ăn sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <>
              {result.message && <p>{result.message}</p>}
              {!result.detectedItems?.length && (
                <Notice>
                  Chưa nhận diện được nguyên liệu. Thử ảnh rõ và đủ sáng hơn.
                </Notice>
              )}
              <div className="vp-detected-items">
                {result.detectedItems?.map((item, i) => (
                  <label key={i} className="vp-check">
                    <input
                      type="checkbox"
                      disabled={item.ingredientId == null || busy}
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
                    {item.ingredientId == null && (
                      <small>Chưa có trong danh mục</small>
                    )}
                  </label>
                ))}
              </div>
              <Button
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
              </Button>
              <p>
                Nhận diện chỉ mang tính gợi ý, không xác nhận thực phẩm an toàn
                để ăn.
              </p>
              {confirmed && suggestions.length > 0 && (
                <h3 className="vp-result-heading">Món có thể nấu</h3>
              )}
              {confirmed &&
                (suggestions.length ? (
                  <div className="vp-grid compact">
                    {suggestions.map((r) => (
                      <Card
                        key={r.recipeId}
                        recipe={{ ...r, id: r.recipeId }}
                        open={open}
                      />
                    ))}
                  </div>
                ) : (
                  <p>Chưa có món gợi ý cho các nguyên liệu đã chọn.</p>
                ))}
            </>
          )}
        </section>
      </div>
    </>
  );
}
