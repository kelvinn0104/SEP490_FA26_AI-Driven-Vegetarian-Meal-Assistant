import { useAuth } from "../context/AuthContext";
import { setStoredUser } from "../api/client";
import { useState, useEffect } from "react";
import { useResource, Button, Notice, PageHeading } from "./ui";
import { listOf, userError, amount } from "./data";
import { request } from "./api";
export function Profile({ flash, go }) {
  const { user, setUser } = useAuth();
  const resource = useResource(() => request("/health-profile"), []);
  const allergens = useResource(() => request("/allergies"), []);
  const [form, setForm] = useState({
    gender: "female",
    dateOfBirth: "",
    heightCm: "",
    weightKg: "",
    activityLevel: "moderate",
    healthGoal: "maintain",
    allergyIds: [],
  });
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(1);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (resource.data) {
      const p = resource.data;
      setForm({
        gender: p.gender || "female",
        dateOfBirth: p.dateOfBirth?.slice(0, 10) || "",
        heightCm: p.heightCm || "",
        weightKg: p.weightKg || "",
        activityLevel: p.activityLevel || "moderate",
        healthGoal: p.healthGoal || "maintain",
        allergyIds:
          p.allergyIds || p.allergies?.map((a) => a.id ?? a.allergyId) || [],
      });
    }
  }, [resource.data]);
  const field = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));
  const save = async (e) => {
    e.preventDefault();
    if (stage === 1) {
      const birth = new Date(form.dateOfBirth + "T12:00:00");
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      if (
        today.getMonth() < birth.getMonth() ||
        (today.getMonth() === birth.getMonth() &&
          today.getDate() < birth.getDate())
      )
        age--;
      if (!Number.isFinite(age) || age < 10 || age > 120) {
        setError("Độ tuổi hiện hỗ trợ từ 10 đến 120.");
        return;
      }
      setError("");
      setStage(2);
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (
        allergens.error ||
        (resource.error && resource.error.status !== 404) ||
        resource.loading
      )
        throw new Error(
          "Cần tải đầy đủ hồ sơ và danh mục dị ứng trước khi lưu để bảo toàn dữ liệu.",
        );
      await request(
        "/health-profile",
        {
          ...form,
          heightCm: Number(form.heightCm),
          weightKg: Number(form.weightKg),
        },
        "PUT",
      );
      const updatedUser = { ...user, hasHealthProfile: true };
      setUser(updatedUser);
      setStoredUser(updatedUser);
      flash("Đã lưu hồ sơ sức khỏe.");
      setSaved(true);
      resource.reload();
    } catch (e) {
      setError(userError(e));
    } finally {
      setBusy(false);
    }
  };
  if (saved)
    return (
      <section className="vp-profile-complete">
        <h1>Hồ sơ đã lưu.</h1>
        <p>Bạn có thể cập nhật bất cứ lúc nào. Chọn việc muốn làm tiếp.</p>
        <div className="vp-actions">
          <Button onClick={() => go("discover")}>Khám phá món</Button>
          <Button secondary onClick={() => go("planner")}>
            Xem thực đơn
          </Button>
        </div>
        <button
          className="vp-text-button"
          onClick={() => {
            setSaved(false);
            setStage(1);
          }}
        >
          Xem lại hồ sơ
        </button>
      </section>
    );
  return (
    <>
      <PageHeading title="Hồ sơ sức khỏe" />
      <div className="vp-narrow">
        <p>Cập nhật chỉ số và dị ứng để điều chỉnh thực đơn.</p>
        {resource.data && (
          <section className="vp-profile-summary">
            <div>
              <span>BMI</span>
              <strong>{amount(resource.data.bmi)}</strong>
              <small>{resource.data.bmiCategory}</small>
            </div>
            <div>
              <span>Nhu cầu mỗi ngày</span>
              <strong>
                {amount(resource.data.tdee)} <small>kcal</small>
              </strong>
            </div>
            <div>
              <span>Mục tiêu đạm</span>
              <strong>
                {amount(resource.data.targets?.proteinG)} <small>g</small>
              </strong>
            </div>
          </section>
        )}
        {resource.data?.needsUpdate && (
          <Notice>
            Hồ sơ đã lâu chưa cập nhật. Kiểm tra lại chỉ số để thực đơn phù hợp
            hơn.
          </Notice>
        )}
        {resource.error && resource.error.status !== 404 && (
          <Notice error>
            {resource.error.status === 404
              ? "Chưa có hồ sơ đã lưu. Cần tải được danh mục dị ứng trước khi tạo hồ sơ."
              : userError(resource.error)}{" "}
            <button onClick={resource.reload}>Thử tải lại</button>
          </Notice>
        )}
        {allergens.error && (
          <Notice error>
            Chưa tải được danh mục dị ứng.{" "}
            <button onClick={allergens.reload}>Thử lại</button>
          </Notice>
        )}
        {resource.loading && <p role="status">Đang tải hồ sơ…</p>}
        <form className="vp-panel vp-profile-form" onSubmit={save}>
          <div className="vp-flow-step" aria-live="polite">
            <span>Bước {stage}/2</span>
            <h2>{stage === 1 ? "Chỉ số cơ thể" : "Nhu cầu và dị ứng"}</h2>
          </div>
          <div className="vp-form-grid">
            {stage === 1 && (
              <>
                <label>
                  Giới tính
                  <select value={form.gender} onChange={field("gender")}>
                    <option value="female">Nữ</option>
                    <option value="male">Nam</option>
                  </select>
                </label>
                <label>
                  Ngày sinh
                  <input
                    type="date"
                    required
                    max={new Date().toLocaleDateString("en-CA")}
                    value={form.dateOfBirth}
                    onChange={field("dateOfBirth")}
                  />
                </label>
                <label>
                  Chiều cao (cm)
                  <input
                    type="number"
                    required
                    min="50"
                    max="250"
                    step="0.1"
                    value={form.heightCm}
                    onChange={field("heightCm")}
                  />
                </label>
                <label>
                  Cân nặng (kg)
                  <input
                    type="number"
                    required
                    min="20"
                    max="300"
                    step="0.1"
                    value={form.weightKg}
                    onChange={field("weightKg")}
                  />
                </label>
              </>
            )}
            {stage === 2 && (
              <>
                <label>
                  Vận động
                  <select
                    value={form.activityLevel}
                    onChange={field("activityLevel")}
                  >
                    <option value="sedentary">Ít vận động</option>
                    <option value="light">Nhẹ</option>
                    <option value="moderate">Vừa</option>
                    <option value="active">Nhiều</option>
                    <option value="very_active">Rất nhiều</option>
                  </select>
                </label>
                <label>
                  Mục tiêu
                  <select
                    value={form.healthGoal}
                    onChange={field("healthGoal")}
                  >
                    <option value="maintain">Duy trì</option>
                    <option value="loss">Giảm cân</option>
                    <option value="gain">Tăng cân</option>
                  </select>
                </label>
              </>
            )}
          </div>
          {stage === 2 && (
            <fieldset>
              <legend>Dị ứng thực phẩm</legend>
              {allergens.error ? (
                <Notice error>
                  Chưa tải được danh mục dị ứng. Không thể lưu hồ sơ lúc này.
                </Notice>
              ) : allergens.loading ? (
                <p>Đang tải…</p>
              ) : (
                listOf(allergens.data).map((a) => (
                  <label className="vp-check" key={a.id}>
                    <input
                      type="checkbox"
                      checked={form.allergyIds.includes(a.id)}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          allergyIds: e.target.checked
                            ? [...p.allergyIds, a.id]
                            : p.allergyIds.filter((id) => id !== a.id),
                        }))
                      }
                    />
                    {a.name}
                  </label>
                ))
              )}
            </fieldset>
          )}
          {error && <Notice error>{error}</Notice>}
          <Button
            disabled={
              busy ||
              resource.loading ||
              (!!resource.error && resource.error.status !== 404) ||
              allergens.loading ||
              !!allergens.error
            }
          >
            {busy ? "Đang lưu…" : stage === 1 ? "Tiếp tục" : "Lưu hồ sơ"}
          </Button>
          {stage === 2 && (
            <button
              type="button"
              className="vp-text-button"
              disabled={busy}
              onClick={() => setStage(1)}
            >
              Quay lại chỉ số
            </button>
          )}
        </form>
      </div>
    </>
  );
}
export function Account({ user }) {
  const { setUser } = useAuth();
  const [name, setName] = useState(user.displayName || user.name || "");
  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const save = async (e, changePassword) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      if (changePassword) {
        await request("/Auth/change-password", password);
        setPassword({ currentPassword: "", newPassword: "" });
        setMessage("Đã đổi mật khẩu.");
      } else {
        const saved = await request(
          "/Auth/me",
          { displayName: name.trim() },
          "PUT",
        );
        if (!saved?.email)
          throw new Error("Chưa nhận được thông tin tài khoản đã cập nhật.");
        const next = { ...user, ...saved };
        setStoredUser(next);
        setUser(next);
        setMessage("Đã cập nhật tên hiển thị.");
      }
    } catch (e) {
      setError(userError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageHeading title="Tài khoản" />
      <div className="vp-settings-layout">
        {error && <Notice error>{error}</Notice>}
        {message && <Notice>{message}</Notice>}
        <form className="vp-panel" onSubmit={(e) => save(e, false)}>
          <h2>Thông tin của bạn</h2>
          <label>
            Email
            <input value={user.email || ""} readOnly autoComplete="email" />
          </label>
          <label>
            Tên hiển thị
            <input
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <Button disabled={busy || !name.trim()}>Lưu thay đổi</Button>
        </form>
        <form
          className="vp-panel"
          onSubmit={(e) => save(e, true)}
        >
          <h2>Đổi mật khẩu</h2>
          <label>
            Mật khẩu hiện tại
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password.currentPassword}
              onChange={(e) =>
                setPassword((p) => ({ ...p, currentPassword: e.target.value }))
              }
            />
          </label>
          <label>
            Mật khẩu mới
            <input
              required
              minLength={8}
              type="password"
              autoComplete="new-password"
              value={password.newPassword}
              onChange={(e) =>
                setPassword((p) => ({ ...p, newPassword: e.target.value }))
              }
            />
          </label>
          <Button disabled={busy}>Đổi mật khẩu</Button>
        </form>
      </div>
    </>
  );
}
