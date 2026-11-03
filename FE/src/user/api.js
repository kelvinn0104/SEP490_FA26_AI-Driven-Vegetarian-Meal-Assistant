import {
  API_BASE_URL,
  getAuthToken,
  setAuthToken,
  setStoredUser,
  unwrap,
} from "../api/client";

// User requests are isolated from the admin client. Mutations are never retried automatically.
export async function request(path, body, method, signal) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    path.includes("/generate") ? 180000 : 90000,
  );
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const token = getAuthToken();
  const multipart = body instanceof FormData;
  try {
    const response = await fetch(
      `${API_BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`,
      {
        method: method || (body === undefined ? "GET" : "POST"),
        headers: {
          ...(body !== undefined && !multipart
            ? { "Content-Type": "application/json" }
            : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...(body === undefined
          ? {}
          : { body: multipart ? body : JSON.stringify(body) }),
        signal: controller.signal,
      },
    );
    if (response.status === 204) return null;
    const json = (response.headers.get("content-type") || "").includes("json");
    const data = json ? await response.json() : null;
    if (!response.ok || data?.success === false) {
      const error = new Error(
        (data?.errors && typeof data.errors === "object"
          ? Object.values(data.errors).flat().join("\n")
          : null) ||
          data?.detail ||
          data?.message ||
          data?.title ||
          "Dịch vụ tạm thời không khả dụng.",
      );
      error.status = response.status;
      error.data = data;
      if (response.status === 401 && token) {
        setAuthToken(null);
        setStoredUser(null);
        window.dispatchEvent(new Event("veggie:session-expired"));
      }
      throw error;
    }
    if (!json) throw new Error("Máy chủ trả về dữ liệu không hợp lệ.");
    return unwrap(data);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
