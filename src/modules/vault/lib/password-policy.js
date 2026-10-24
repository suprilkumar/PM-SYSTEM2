// Client-side validation used by setup, change-password, recovery
export const MIN_PASSWORD_LENGTH = 8;

export function validatePassword(password) {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` };
  }
  if (!/[A-Z]/.test(password)) {
    return { ok: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { ok: false, message: "Password must contain at least one number" };
  }
  return { ok: true, strength: strengthOf(password) };
}

function strengthOf(p) {
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) score++;
  return score; // 0-4
}

export function validatePin(pin) {
  if (!/^\d{6}$/.test(pin)) {
    return { ok: false, message: "PIN must be exactly 6 digits" };
  }
  return { ok: true };
}

export function validateDob(dobStr) {
  if (!dobStr) return { ok: false, message: "Date of birth is required" };
  const d = new Date(dobStr);
  if (isNaN(d.getTime())) return { ok: false, message: "Invalid date" };
  const now = new Date();
  const age = (now - d) / (365.25 * 24 * 60 * 60 * 1000);
  if (age < 13) return { ok: false, message: "You must be at least 13 years old" };
  if (age > 120) return { ok: false, message: "Invalid date" };
  return { ok: true };
}