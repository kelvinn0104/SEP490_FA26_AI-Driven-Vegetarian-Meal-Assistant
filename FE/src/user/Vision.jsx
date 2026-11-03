import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { Button, Notice, PageHeading, Card } from "./ui";
import { userError, validatePhoto, isTestContent } from "./data";
import { request } from "./api";
export function Vision({ open, flash }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
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
    if (!file || busy) return;
    setBusy(true);
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
      setSelected(
        (data?.detectedItems || [])
          .filter((i) => i.ingredientId != null)
          .map((i) => i.ingredientId),
      );
    } catch (e) {
      setError(userError(e));
    } finally {
      setBusy(false);
    }
  };
  const confirm = async () => {
    setBusy(true);
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
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading
        title="Có gì trong tủ lạnh?"
        eyebrow="Từ nguyên liệu đến bữa ăn"
      />
      <div className="vp-two-columns">
        <section className="vp-panel">
          <h2>Chọn ảnh nguyên liệu</h2>
          <p>
            Chụp rõ từng nguyên liệu, đủ sáng. Bạn sẽ kiểm tra lại kết quả trước
            khi dùng.
          </p>
          <label className="vp-upload">
            <Camera size={30} />
            <span>Chọn ảnh từ thiết bị</span>
            <small>JPG, PNG, WebP · tối đa 8 MB</small>
            <input
              disabled={busy}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={choose}
            />
          </label>
          {preview && (
            <img
              className="vp-scan-preview"
              src={preview}
              alt="Ảnh nguyên liệu đã chọn"
            />
          )}
          {error && <Notice error>{error}</Notice>}
          <Button disabled={!file || busy} onClick={scan}>
            {busy ? "Đang xử lý…" : "Nhận diện nguyên liệu"}
          </Button>
        </section>
        <section className="vp-panel">
          <h2>Kiểm tra kết quả</h2>
          {!result ? (
            <p>Kết quả và gợi ý món ăn sẽ xuất hiện tại đây.</p>
          ) : (
            <>
              {result.message && <p>{result.message}</p>}
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
              <Button
                disabled={
                  busy || confirmed || !selected.length || !result.scanId
                }
                onClick={confirm}
              >
                {confirmed ? "Đã xác nhận nguyên liệu" : "Xác nhận nguyên liệu"}
              </Button>
              <p>
                Nhận diện chỉ mang tính gợi ý, không xác nhận thực phẩm an toàn
                để ăn.
              </p>
              {!!result.suggestedRecipes?.length && (
                <h3 className="vp-result-heading">Món có thể nấu</h3>
              )}
              <div className="vp-grid compact">
                {result.suggestedRecipes
                  ?.filter((r) => !isTestContent(r))
                  .map((r) => (
                    <Card
                      key={r.recipeId}
                      recipe={{ ...r, id: r.recipeId }}
                      open={open}
                    />
                  ))}
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
