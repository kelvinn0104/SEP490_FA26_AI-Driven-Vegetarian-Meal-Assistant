import { useState, useEffect, useRef } from "react";
import { Leaf, ArrowRight, Mail, Check, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { request } from "./api";
import { BrandArt } from "./BrandArt";
import { Button, Notice } from "./ui";
import { userError } from "./data";
import {
  PENDING_KEY,
  pendingVerification,
  secondsUntil,
  readPending,
} from "./otp";

export function AuthForm({ register, go, onLogin }) {
  const { login } = useAuth();
  const [pending, setPending] = useState(() => readPending(sessionStorage));
  const [step, setStep] = useState(() =>
    register && readPending(sessionStorage) ? "otp" : "form",
  );
  const [email, setEmail] = useState(
    () => readPending(sessionStorage)?.email || "",
  );
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSlots, setOtpSlots] = useState(["", "", "", "", "", ""]);
  const otp = otpSlots.join("");
  const resetOtp = () => setOtpSlots(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [now, setNow] = useState(Date.now());
  const otpInputs = useRef([]);

  useEffect(() => {
    if (step !== "otp") return;
    setTimeout(() => {
      otpInputs.current[0]?.focus();
    }, 100);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [step]);
  const cooldown = secondsUntil(pending?.resendAt, now) || 0;
  const remaining = secondsUntil(pending?.expiresAt, now);
  const remember = (response) => {
    const next = pendingVerification(response, email);
    setPending(next);
    setEmail(next.email);
    setNow(Date.now());
    try {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(next));
    } catch {
      /* Verification still works when storage is unavailable. */
    }
    setPassword("");
    setConfirmPassword("");
    resetOtp();
    setStep("otp");
    setInfo(
      response?.codeSent === false
        ? "Mã đã được gửi trước đó. Dùng mã gần nhất trong hộp thư của bạn."
        : "Đã gửi mã xác thực. Kiểm tra hộp thư đến và thư rác.",
    );
  };
  const showError = (err) => {
    const details = err.data;
    if (err.status === 429 && pending && err.retryAfterSeconds) {
      const next = {
        ...pending,
        resendAt: Date.now() + err.retryAfterSeconds * 1000,
      };
      setPending(next);
      setNow(Date.now());
      try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(next));
      } catch {
        /* Optional resume state. */
      }
    }
    if (
      err.status === 403 &&
      (JSON.stringify(details || {}).includes("EMAIL_NOT_VERIFIED") ||
        /chưa xác thực/i.test(err.message))
    ) {
      const next = {
        email: email.trim().toLowerCase(),
        expiresAt: null,
        resendAt: Date.now(),
      };
      setPending(next);
      setStep("otp");
      setError(
        "Email chưa được xác thực. Nhập mã đã nhận hoặc yêu cầu gửi lại.",
      );
      setPassword("");
      try {
        sessionStorage.setItem(PENDING_KEY, JSON.stringify(next));
      } catch {
        /* Optional resume state. */
      }
    } else
      setError(
        [400, 401, 403, 409, 429].includes(err.status)
          ? err.message
          : userError(err),
      );
  };
  const submit = async (e) => {
    e.preventDefault();
    if (lock.current) return;
    if (register && step === "form" && name.trim().length < 2) {
      setError(
        "Tên hiển thị cần ít nhất 2 ký tự, không tính khoảng trắng ở đầu và cuối.",
      );
      return;
    }
    lock.current = true;
    setBusy(true);
    setError("");
    setInfo("");
    try {
      if (register && step === "form") {
        if (password !== confirmPassword) {
          setError("Mật khẩu xác nhận không khớp.");
          setBusy(false);
          lock.current = false;
          return;
        }
        remember(
          await request("/Auth/register", {
            email: email.trim().toLowerCase(),
            password,
            displayName: name.trim(),
            role: "user",
          }),
        );
      } else {
        if (step === "otp" && remaining === 0)
          throw new Error("Mã đã hết hạn. Vui lòng gửi lại mã mới.");
        const data = await request(
          step === "otp" ? "/Auth/verify-code" : "/Auth/login",
          step === "otp"
            ? { email: email.trim().toLowerCase(), otpCode: otp }
            : { email: email.trim().toLowerCase(), password },
        );
        const token = data?.accessToken || data?.token;
        if (!token || !data?.user)
          throw new Error(
            "Chưa nhận được phiên đăng nhập hợp lệ. Vui lòng thử lại.",
          );
        try {
          sessionStorage.removeItem(PENDING_KEY);
        } catch {
          /* Optional resume state. */
        }
        login(data.user, token);
        onLogin(data.user, token, { verified: step === "otp" });
      }
    } catch (err) {
      showError(err);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const resend = async () => {
    if (cooldown || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setInfo("");
    try {
      remember(
        await request("/Auth/resend-code", {
          email: email.trim().toLowerCase(),
        }),
      );
    } catch (err) {
      showError(err);
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  const changeEmail = () => {
    try {
      sessionStorage.removeItem(PENDING_KEY);
    } catch {
      /* Optional resume state. */
    }
    setPending(null);
    setStep("form");
    resetOtp();
    setError("");
    setInfo("");
  };

  const handleOtpChange = (index, value) => {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      setOtpSlots((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    if (clean.length > 1) {
      setOtpSlots((prev) => {
        const next = [...prev];
        for (let j = 0; j < clean.length && index + j < 6; j++) {
          next[index + j] = clean[j];
        }
        return next;
      });
      const nextFocus = Math.min(index + clean.length, 5);
      otpInputs.current[nextFocus]?.focus();
      return;
    }

    const char = clean.slice(-1);
    setOtpSlots((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
    if (index < 5) {
      otpInputs.current[index + 1]?.focus();
      otpInputs.current[index + 1]?.select();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otpSlots[index] && index > 0) {
        e.preventDefault();
        setOtpSlots((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
        otpInputs.current[index - 1]?.focus();
      } else if (otpSlots[index]) {
        e.preventDefault();
        setOtpSlots((prev) => {
          const next = [...prev];
          next[index] = "";
          return next;
        });
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (index > 0) {
        otpInputs.current[index - 1]?.focus();
        otpInputs.current[index - 1]?.select();
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (index < 5) {
        otpInputs.current[index + 1]?.focus();
        otpInputs.current[index + 1]?.select();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData?.getData("text") || "";
    const clean = text.replace(/\D/g, "").slice(0, 6);
    if (clean) {
      const arr = clean.split("");
      setOtpSlots((prev) => {
        const next = [...prev];
        for (let i = 0; i < 6; i++) {
          next[i] = arr[i] || "";
        }
        return next;
      });
      const focusIndex = Math.min(clean.length, 5);
      otpInputs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="vp-auth">
      <div className="vp-auth-photo" aria-hidden="true" />
      <aside>
        <BrandArt />
        <Leaf size={40} strokeWidth={1.2} />
        <span className="vp-eyebrow">Bếp chay mỗi ngày</span>
        <h1>
          Bữa ăn vừa ý.
          <br />
          Một ngày nhẹ hơn.
        </h1>
        <div className="vp-auth-benefits">
          <span>
            <Check size={16} /> Công thức từ thư viện
          </span>
          <span>
            <Check size={16} /> Thực đơn theo nhu cầu
          </span>
          <span>
            <Check size={16} /> Ghi lại những bữa đã ăn
          </span>
        </div>
      </aside>
      <section>
        {(register || step === "otp") && (
          <div className="vp-auth-steps" aria-label="Tiến trình đăng ký">
            <span aria-current={step === "form" ? "step" : undefined}>
              01 · Tài khoản
            </span>
            <span aria-current={step === "otp" ? "step" : undefined}>
              02 · Xác thực email
            </span>
          </div>
        )}
        <span className="vp-eyebrow">
          {step === "otp"
            ? "Chỉ còn một bước"
            : register
              ? "Bắt đầu cùng VeggieAI"
              : "Chào bạn trở lại"}
        </span>
        <h2>
          {step === "otp"
            ? "Mở hộp thư của bạn"
            : register
              ? "Tạo tài khoản"
              : "Đăng nhập"}
        </h2>
        <p>
          {step === "otp" ? (
            <>
              Nhập mã 6 số gửi đến <strong>{email}</strong>.
            </>
          ) : (
            "Dùng email của bạn để tiếp tục."
          )}
        </p>
        <form
          onSubmit={submit}
          aria-busy={busy}
          onInvalid={(event) => {
            const input = event.target;
            const label = input
              .closest("label")
              ?.childNodes[0]?.textContent?.trim();
            input.setCustomValidity(
              input.validity.valueMissing
                ? `Vui lòng nhập ${label?.toLowerCase() || "thông tin này"}.`
                : input.validity.typeMismatch
                  ? "Nhập địa chỉ email hợp lệ, ví dụ ban@example.com."
                  : input.validity.patternMismatch
                    ? "Mã xác thực gồm 6 chữ số."
                    : input.validity.tooShort
                      ? `Cần nhập ít nhất ${input.minLength} ký tự.`
                      : "",
            );
          }}
          onInput={(event) => event.target.setCustomValidity?.("")}
        >
          {error && <Notice error>{error}</Notice>}
          {info && <Notice>{info}</Notice>}
          {step === "otp" ? (
            <>
              <label>
                Mã xác thực
                <div className="vp-otp-boxes" onPaste={handleOtpPaste}>
                  {otpSlots.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (otpInputs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={2}
                      disabled={busy}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onFocus={(e) => e.target.select()}
                      className="vp-otp-box"
                      aria-label={`Số thứ ${index + 1}`}
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                    />
                  ))}
                </div>
              </label>
              <p className="vp-otp-expiry" id="vp-otp-expiry">
                {remaining === 0
                  ? "Mã đã hết hạn. Yêu cầu mã mới để tiếp tục."
                  : remaining != null
                    ? `Mã có hiệu lực trong ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
                    : "Dùng mã gần nhất được gửi đến email của bạn."}
              </p>
            </>
          ) : (
            <>
              {register && (
                <label>
                  Tên hiển thị
                  <input
                    autoComplete="name"
                    minLength={2}
                    maxLength={100}
                    required
                    disabled={busy}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              )}
              <label>
                Email
                <input
                  type="email"
                  required
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={busy}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label>
                Mật khẩu
                <div className="vp-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    minLength={register ? 6 : 1}
                    required
                    autoComplete={register ? "new-password" : "current-password"}
                    disabled={busy}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                  />
                  <button
                    type="button"
                    className="vp-password-toggle"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>
              {register && (
                <label>
                  Xác nhận mật khẩu
                  <div className="vp-password-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      minLength={6}
                      required
                      autoComplete="new-password"
                      disabled={busy}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Xác nhận mật khẩu"
                    />
                    <button
                      type="button"
                      className="vp-password-toggle"
                      aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>
              )}
              {register && (
                <small>
                  Tối thiểu 6 ký tự. Nên dùng mật khẩu riêng cho tài khoản này.
                </small>
              )}
            </>
          )}
          <Button
            disabled={
              busy || (step === "otp" && (otp.length !== 6 || remaining === 0))
            }
          >
            {busy
              ? "Đang xử lý…"
              : step === "otp"
                ? "Xác thực & tiếp tục"
                : register
                  ? "Tạo tài khoản"
                  : "Đăng nhập"}
            <ArrowRight size={17} />
          </Button>
        </form>
        {step === "otp" ? (
          <>
            <div className="vp-actions">
              <button
                className="vp-text-button"
                disabled={busy || cooldown > 0}
                onClick={resend}
              >
                <Mail size={16} />
                {cooldown ? `Gửi lại sau ${cooldown} giây` : "Gửi lại mã"}
              </button>
              <button
                className="vp-text-button"
                disabled={busy}
                onClick={changeEmail}
              >
                Đổi email
              </button>
            </div>
            <button
              className="vp-text-button"
              disabled={busy}
              onClick={() => {
                setStep("form");
                setError("");
                setInfo("");
                go("login");
              }}
            >
              Đăng nhập bằng mật khẩu
            </button>
            <p className="vp-otp-help">
              Chưa nhận được? Kiểm tra thư rác, địa chỉ email và chờ hết thời
              gian gửi lại.
            </p>
          </>
        ) : (
          <>
            <p className="vp-auth-switch">
              {register ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
              <button onClick={() => go(register ? "login" : "register")}>
                {register ? "Đăng nhập" : "Tạo tài khoản"}
              </button>
            </p>
            {!register && pending && (
              <button className="vp-text-button" onClick={() => go("register")}>
                Tiếp tục xác thực {pending.email}
              </button>
            )}
            {!register && (
              <button
                className="vp-text-button"
                onClick={() => {
                  if (!email.trim() || !email.includes("@")) {
                    setError("Nhập email cần xác thực trước.");
                    return;
                  }
                  const next = {
                    email: email.trim().toLowerCase(),
                    expiresAt: null,
                    resendAt: Date.now(),
                  };
                  setPending(next);
                  setEmail(next.email);
                  setPassword("");
                  setOtp("");
                  try {
                    sessionStorage.setItem(PENDING_KEY, JSON.stringify(next));
                  } catch {
                    /* Optional resume state. */
                  }
                  setStep("otp");
                  setError("");
                }}
              >
                Tài khoản chưa xác thực email?
              </button>
            )}
          </>
        )}
      </section>
    </div>
  );
}
