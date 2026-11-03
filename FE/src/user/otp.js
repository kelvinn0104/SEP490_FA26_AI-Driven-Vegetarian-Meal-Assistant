export const PENDING_KEY = "veggie:pending-verification";
export function pendingVerification(response, email, now = Date.now()) {
  const expiresAt = Date.parse(response?.expiresAt);
  return {
    email: (response?.email || email).trim().toLowerCase(),
    expiresAt: Number.isFinite(expiresAt)
      ? expiresAt
      : Number.isFinite(response?.expiresInSeconds)
        ? now + response.expiresInSeconds * 1000
        : null,
    resendAt: now + Math.max(0, response?.resendAfterSeconds ?? 60) * 1000,
  };
}
export function secondsUntil(timestamp, now = Date.now()) {
  return timestamp == null
    ? null
    : Math.max(0, Math.ceil((timestamp - now) / 1000));
}
export function readPending(storage) {
  try {
    const value = JSON.parse(storage.getItem(PENDING_KEY));
    return value &&
      typeof value.email === "string" &&
      value.email.includes("@") &&
      Number.isFinite(value.resendAt)
      ? value
      : null;
  } catch {
    return null;
  }
}
