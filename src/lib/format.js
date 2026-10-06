const rupee = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function formatRupees(value) {
  if (value == null || Number.isNaN(Number(value))) return "";
  return rupee.format(Number(value));
}

/** ₹12,500 → "12.5k" style, used where space is tight. */
export function shortRupees(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  if (n >= 1000) {
    const k = n / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  }
  return String(n);
}

export function rentRange(min, max) {
  if (min == null && max == null) return "Budget not set";
  if (min == null) return `Up to ₹${shortRupees(max)}`;
  if (max == null || max === min) return `₹${shortRupees(min)}`;
  return `₹${shortRupees(min)}–${shortRupees(max)}`;
}

const DAY = 24 * 60 * 60 * 1000;

/** Parses "YYYY-MM-DD" as a local date (not UTC). */
export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function toDateInput(date) {
  const d = parseDate(date) ?? date;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function daysFromNow(days) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return toDateInput(d);
}

export function daysBetween(a, b) {
  const da = parseDate(a);
  const db = parseDate(b);
  if (!da || !db) return null;
  return Math.round((db - da) / DAY);
}

export function formatMoveIn(value) {
  const d = parseDate(value);
  if (!d) return "Flexible";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d <= today) return "Now";
  const sameYear = d.getFullYear() === today.getFullYear();
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", ...(sameYear ? {} : { year: "numeric" }) });
}

export function relativeTime(value) {
  if (!value) return "";
  const t = new Date(value).getTime();
  const diff = Date.now() - t;
  if (diff < 45 * 1000) return "Just now";
  if (diff < 60 * 60 * 1000) return `${Math.round(diff / 60000)} min ago`;
  const d = new Date(t);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  }
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  if (diff < 6 * DAY) return d.toLocaleDateString("en-IN", { weekday: "short" });
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** "today", "yesterday", "on Monday", "on 3 Oct": reads well after a verb. */
export function whenLabel(value) {
  if (!value) return "";
  const d = new Date(value);
  const diff = Date.now() - d.getTime();
  if (diff < 60 * 60 * 1000) return diff < 90 * 1000 ? "just now" : `${Math.round(diff / 60000)} min ago`;
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "yesterday";
  if (diff < 6 * DAY) return `on ${d.toLocaleDateString("en-IN", { weekday: "long" })}`;
  return `on ${d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`;
}

export function clockTime(value) {
  return new Date(value).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function dayLabel(value) {
  const d = new Date(value);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "Today";
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 5) return "Up late";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function firstName(name) {
  return String(name || "").trim().split(/\s+/)[0] || "there";
}

export function initials(name) {
  const parts = String(name || "?").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function placeLine(person) {
  if (!person) return "";
  if (person.area && person.city) return `${person.area}, ${person.city}`;
  return person.area || person.city || "Location not set";
}

export function ageLine(person) {
  if (!person) return "";
  const bits = [];
  if (person.age) bits.push(String(person.age));
  if (person.occupation) bits.push(person.occupation);
  return bits.join(", ");
}

/** One-line preview of a message for conversation lists. */
export function messagePreview(message, meId) {
  if (!message) return "";
  const mine = message.sender_id === meId;
  if (message.kind === "prefs") return mine ? "You shared your preferences" : "Shared their preferences";
  return `${mine ? "You: " : ""}${message.body}`;
}
