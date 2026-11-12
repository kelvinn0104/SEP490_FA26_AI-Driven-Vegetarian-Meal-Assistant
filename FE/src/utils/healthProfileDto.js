/**
 * Chuyển profile phía FE → body cho PUT /api/health-profile (HealthProfileRequest ở BE).
 *
 * Profile FE có nhiều nguồn (DEFAULT_PROFILE, RegisterPage, dữ liệu sync từ BE) nên tên field không đồng nhất:
 *  - mức vận động: `activityLevel` hoặc `activity`
 *  - tuổi: `dateOfBirth` hoặc `age`
 *  - dị ứng: `allergyIds` (số) hoặc `allergies` (tên chuỗi / object {id, name})
 */

const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very_active'];
const HEALTH_GOALS = ['loss', 'gain', 'maintain'];
const NO_ALLERGY = ['không', 'khong', 'none', ''];

const pad = (n) => String(n).padStart(2, '0');

/** Ngày sinh ISO (yyyy-MM-dd). Ưu tiên dateOfBirth, sau đó suy ra từ age; null nếu không có thông tin. */
export function resolveDateOfBirth(profile) {
  const dob = profile?.dateOfBirth;
  if (typeof dob === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dob)) return dob.slice(0, 10);

  const age = Number(profile?.age);
  if (Number.isFinite(age) && age >= 5 && age <= 120) {
    const now = new Date();
    return `${now.getFullYear() - Math.round(age)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
  return null;
}

/** Tuổi tính từ ngày sinh ISO. */
export function ageFromDateOfBirth(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

/**
 * Danh sách ID dị ứng để gửi lên BE.
 * - `null`  → BE giữ nguyên danh sách dị ứng hiện tại (khi không xác định được user muốn gì).
 * - `[]`    → user chủ động bỏ hết dị ứng.
 * @param {object} profile
 * @param {{id:number,name:string}[]} catalog danh mục GET /api/allergies
 */
export function resolveAllergyIds(profile, catalog = []) {
  if (Array.isArray(profile?.allergyIds)) {
    return profile.allergyIds.map(Number).filter(Number.isFinite);
  }

  const list = profile?.allergies;
  if (!Array.isArray(list)) return null;

  const names = list
    .map((a) => (a && typeof a === 'object' ? a : { name: String(a ?? '') }))
    .filter((a) => !NO_ALLERGY.includes(String(a.name || '').trim().toLowerCase()) || a.id);

  if (names.length === 0) return [];

  const norm = (s) => String(s || '').trim().toLowerCase();
  const ids = new Set();
  let unresolved = 0;
  for (const a of names) {
    if (Number.isFinite(Number(a.id)) && a.id !== null && a.id !== undefined) {
      ids.add(Number(a.id));
      continue;
    }
    const hit = catalog.find((c) => norm(c.name) === norm(a.name))
      || catalog.find((c) => norm(c.name).includes(norm(a.name)) || norm(a.name).includes(norm(c.name)));
    if (hit) ids.add(Number(hit.id));
    else unresolved += 1;
  }

  // Không map được tên nào (catalog rỗng / BE lỗi) → giữ nguyên trên BE thay vì xóa sạch.
  if (ids.size === 0 && unresolved > 0) return null;
  return [...ids];
}

export function buildHealthProfileDto(profile, allergyCatalog = []) {
  const activity = profile?.activityLevel || profile?.activity;
  const goal = profile?.goal || profile?.healthGoal;
  return {
    gender: profile?.gender === 'male' ? 'male' : 'female',
    dateOfBirth: resolveDateOfBirth(profile) || '2000-01-01',
    heightCm: Number(profile?.height ?? profile?.heightCm),
    weightKg: Number(profile?.weight ?? profile?.weightKg),
    activityLevel: ACTIVITY_LEVELS.includes(activity) ? activity : 'moderate',
    healthGoal: HEALTH_GOALS.includes(goal) ? goal : 'maintain',
    allergyIds: resolveAllergyIds(profile, allergyCatalog),
  };
}
