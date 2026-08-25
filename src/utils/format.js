export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function isValidUsername(username) {
  return /^[a-zA-Z0-9._]{3,20}$/.test(String(username).trim());
}

export function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-4)}`;
}

export function extractHashtags(text = "") {
  return [...new Set((String(text).match(/#([a-zA-Z0-9_]+)/g) || []).map((t) => t.slice(1).toLowerCase()))];
}

export function normalizeQuery(q = "") {
  return String(q).trim().replace(/^#/, "").toLowerCase();
}
