import { DEMO_ME, DEMO_PEOPLE, DEMO_THREADS } from "./demoPeople";
import { computeMatch } from "../lib/match";
import { daysFromNow, firstName, parseDate, rentRange } from "../lib/format";
import { pickPrefs, PROFILE_FIELDS } from "../lib/options";

/*
  A local stand-in for the Supabase backend so the app can be explored
  without an account. It keeps state in localStorage and plays the other
  side: people accept requests, reply to messages and come online.
*/

const KEY = "rf-demo-state-v2";
const MIN = 60 * 1000;

const ago = (minutes) => new Date(Date.now() - minutes * MIN).toISOString();
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);
const clone = (v) => (typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

function materialise(person, createdMinutesAgo) {
  return {
    avatar_url: null,
    visible: true,
    show_online: true,
    onboarded: true,
    created_at: ago(createdMinutesAgo),
    ...person,
    move_in: daysFromNow(person.move_in),
  };
}

function seed() {
  const members = DEMO_PEOPLE.map((p, i) => materialise(p, 60 * 24 * (i + 2)));
  const me = { ...materialise(DEMO_ME, 0), avatar_url: null };

  const conn = (other, direction, status, minutesAgo, note = "") => ({
    id: uid(),
    requester_id: direction === "out" ? "me" : other,
    addressee_id: direction === "out" ? other : "me",
    status,
    note,
    created_at: ago(minutesAgo),
    updated_at: ago(minutesAgo),
  });

  const connections = [
    conn("d04", "in", "accepted", 60 * 52),
    conn("d06", "out", "accepted", 60 * 24 * 4),
    conn("d05", "in", "accepted", 60 * 30),
    conn("d02", "in", "pending", 60 * 2, "Hey! Looks like we're both after a room near the tech parks. Want to team up?"),
    conn("d08", "in", "pending", 60 * 20, "Looking for people to rent near campus with, you seem easy to live with."),
    conn("d01", "out", "pending", 60 * 18),
  ];

  const messages = [];
  for (const [other, lines] of Object.entries(DEMO_THREADS)) {
    for (const [from, minutesAgo, body] of lines) {
      const mine = from === "me";
      messages.push({
        id: uid(),
        sender_id: mine ? "me" : other,
        recipient_id: mine ? other : "me",
        body,
        created_at: ago(minutesAgo),
        read_at: mine ? ago(minutesAgo - 5) : other === "d05" ? null : ago(minutesAgo - 2),
      });
    }
  }

  const activity = [
    { id: uid(), kind: "request", actor_id: "d02", created_at: ago(60 * 2), read_at: null },
    { id: uid(), kind: "request", actor_id: "d08", created_at: ago(60 * 20), read_at: null },
    { id: uid(), kind: "accepted", actor_id: "d06", created_at: ago(60 * 24 * 4 - 30), read_at: ago(60 * 24 * 3) },
    { id: uid(), kind: "welcome", actor_id: null, created_at: ago(60 * 24 * 5), read_at: ago(60 * 24 * 5) },
  ];

  return {
    version: 2,
    me,
    members,
    connections,
    saved: ["d16", "d12"],
    messages,
    activity,
    pendingAccept: ["d01"],
  };
}

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === 2) return parsed;
    }
  } catch {
    // Storage blocked or corrupt: start fresh.
  }
  return seed();
}

let state = null;
const listeners = new Set();
const timers = new Set();

function db() {
  if (!state) {
    state = read();
    persist();
  }
  return state;
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Quota or privacy mode: the demo keeps working in memory.
  }
}

function emit(event) {
  for (const fn of listeners) fn(event);
}

function later(ms, fn) {
  const t = setTimeout(() => {
    timers.delete(t);
    fn();
  }, ms);
  timers.add(t);
}

function person(id) {
  return db().members.find((m) => m.id === id);
}

function between(other) {
  return db().connections.find(
    (c) => (c.requester_id === "me" && c.addressee_id === other) || (c.addressee_id === "me" && c.requester_id === other),
  );
}

function pushActivity(kind, actorId) {
  db().activity.unshift({ id: uid(), kind, actor_id: actorId, created_at: new Date().toISOString(), read_at: null });
}

function addMessage(from, to, body, extra = {}) {
  const msg = {
    id: uid(),
    sender_id: from,
    recipient_id: to,
    body,
    kind: extra.kind || "text",
    payload: extra.payload ?? null,
    created_at: new Date().toISOString(),
    read_at: null,
  };
  db().messages.push(msg);
  return msg;
}

/* ---------- The other side of the conversation ---------- */

function replyFor(other, text) {
  const p = person(other);
  const t = text.toLowerCase();
  const name = firstName(db().me.full_name);
  const said = db().messages.filter((m) => m.sender_id === other).length;

  if (/\b(rent|budget|deposit|price|cost|how much)\b/.test(t)) {
    return p.housing === "has_room"
      ? `The room is ${rentRange(p.rent_min, p.rent_max)} a month depending on the room, plus electricity split equally. Deposit is two months.`
      : `I'm hoping to keep my share around ${rentRange(p.rent_min, p.rent_max)} a month including bills. Does that work for you?`;
  }
  if (/\b(visit|see it|come by|come over|saturday|sunday|weekend|tomorrow)\b/.test(t)) {
    return p.housing === "has_room"
      ? "Sure! Saturday around 11 works for me. I'll send you the location pin."
      : "Saturday works for me. Shall we look at a couple of places together?";
  }
  if (/\b(call|phone|number|whatsapp)\b/.test(t)) return "Let's do a quick call this evening? Around 8 works for me.";
  if (/\b(pet|pets|cat|dog)\b/.test(t)) {
    if (p.pets === "have") return "Yes, there's a pet here! Very friendly, I promise.";
    if (p.pets === "allergic") return "I'm actually allergic, so a pet-free place would be best for me.";
    return "I love animals, so pets are totally fine with me.";
  }
  if (/\b(food|cook|cooking|veg|kitchen|meat)\b/.test(t)) {
    if (p.diet === "veg" || p.diet === "vegan") return "I keep a vegetarian kitchen, but I'm happy to work out shelves and utensils.";
    return "I cook most nights. Happy to share or keep things separate, whatever you prefer.";
  }
  if (/\b(when|move|moving|date)\b/.test(t)) return `I'm aiming to move around ${parseDate(p.move_in).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}, but I can be a bit flexible.`;
  if (/\b(hi|hello|hey|hola)\b/.test(t) && said < 2) return `Hi ${name}! Nice to hear from you. What are you looking for in a flatmate?`;

  const generic = [
    "Sounds good to me!",
    "Ha, fair enough. What's your usual routine on weekdays?",
    "Nice. Tell me a bit about the area you prefer?",
    "That works. Anything that's a dealbreaker for you?",
    "Good to know! I think we'd get along.",
  ];
  return generic[said % generic.length];
}

/** How someone reacts when you share your preferences, and their own card back. */
function repliesToPrefs(other, shared) {
  const p = person(other);
  const score = computeMatch(p, { ...db().me, ...shared }).score;
  const text =
    score >= 75
      ? "Thanks for sharing! We line up on almost everything. Here are mine so you can compare."
      : score >= 55
        ? "Thanks! Mostly similar, with a couple of things we should talk about. Here are mine."
        : "Thanks for sharing. We're different on a few things, but I'm happy to chat. Here are mine.";
  const alreadyShared = db().messages.some((m) => m.sender_id === other && m.kind === "prefs");
  const out = [[text, {}]];
  if (!alreadyShared) out.push(["Shared my preferences", { kind: "prefs", payload: pickPrefs(p) }]);
  return out;
}

function scheduleReply(other, text, extra = {}) {
  const replies = extra.kind === "prefs" ? repliesToPrefs(other, extra.payload || {}) : [[replyFor(other, text), {}]];
  later(1200, () => emit({ type: "typing", from: other }));
  replies.forEach(([body, more], i) => {
    later(1200 + 2200 + i * 1400, () => {
      const conn = between(other);
      if (!conn || conn.status !== "accepted") return;
      const msg = addMessage(other, "me", body, more);
      persist();
      emit({ type: "message", row: clone(msg) });
    });
  });
}

function scheduleAccept(other, delay) {
  later(delay, () => {
    const conn = between(other);
    if (!conn || conn.status !== "pending" || conn.requester_id !== "me") return;
    conn.status = "accepted";
    conn.updated_at = new Date().toISOString();
    db().pendingAccept = (db().pendingAccept || []).filter((id) => id !== other);
    pushActivity("accepted", other);
    persist();
    emit({ type: "connections" });
    emit({ type: "activity", kind: "accepted", actor: other });

    later(2500, () => emit({ type: "typing", from: other }));
    later(4800, () => {
      const p = person(other);
      const body =
        p.housing === "has_room"
          ? `Hi ${firstName(db().me.full_name)}! Thanks for reaching out. The room is still available if you'd like to know more.`
          : `Hi ${firstName(db().me.full_name)}! Thanks for connecting. Where are you hoping to live?`;
      const msg = addMessage(other, "me", body);
      persist();
      emit({ type: "message", row: clone(msg) });
    });
  });
}

/* ---------- Public API (same shape as the Supabase one) ---------- */

export function createDemoApi() {
  let started = false;

  return {
    mode: "demo",
    uid: "me",

    async loadMe() {
      return clone(db().me);
    },
    async saveMe(patch) {
      const s = db();
      for (const key of PROFILE_FIELDS) if (key in patch) s.me[key] = patch[key];
      s.me.updated_at = new Date().toISOString();
      persist();
      return clone(s.me);
    },
    async loadMembers() {
      return clone(db().members);
    },
    async loadConnections() {
      return clone(db().connections);
    },
    async connect(other, note = "") {
      const s = db();
      const existing = between(other);
      if (existing) return clone(existing);
      const row = {
        id: uid(),
        requester_id: "me",
        addressee_id: other,
        status: "pending",
        note: note.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      s.connections.push(row);
      persist();
      // People who fit reasonably well say yes after a moment.
      const score = computeMatch(person(other), s.me).score;
      if (score >= 55) {
        s.pendingAccept = [...(s.pendingAccept || []), other];
        persist();
        scheduleAccept(other, 3500);
      }
      return clone(row);
    },
    async respond(connId, accept) {
      const s = db();
      const conn = s.connections.find((c) => c.id === connId && c.addressee_id === "me");
      if (!conn) throw new Error("That request is no longer available.");
      if (!accept) {
        s.connections = s.connections.filter((c) => c.id !== connId);
        persist();
        return null;
      }
      conn.status = "accepted";
      conn.updated_at = new Date().toISOString();
      persist();
      const other = conn.requester_id;
      later(1500, () => emit({ type: "typing", from: other }));
      later(3500, () => {
        const msg = addMessage(other, "me", "Thanks for accepting! When are you planning to move?");
        persist();
        emit({ type: "message", row: clone(msg) });
      });
      return clone(conn);
    },
    async removeConnection(connId) {
      const s = db();
      s.connections = s.connections.filter((c) => c.id !== connId);
      persist();
    },
    async loadSaved() {
      return [...db().saved];
    },
    async setSaved(memberId, on) {
      const s = db();
      s.saved = s.saved.filter((id) => id !== memberId);
      if (on) s.saved.unshift(memberId);
      persist();
    },
    async loadMessages() {
      return clone(db().messages);
    },
    async sendMessage(to, body, extra = {}) {
      const conn = between(to);
      if (!conn || conn.status !== "accepted") throw new Error("You can only message people you're connected with.");
      const msg = addMessage("me", to, body, extra);
      persist();
      // They read it shortly before replying.
      later(1000, () => {
        msg.read_at = new Date().toISOString();
        persist();
        emit({ type: "message-update", row: clone(msg) });
      });
      scheduleReply(to, body, extra);
      return clone(msg);
    },
    async markRead(fromId) {
      const now = new Date().toISOString();
      for (const m of db().messages) if (m.sender_id === fromId && m.recipient_id === "me" && !m.read_at) m.read_at = now;
      persist();
    },
    async loadActivity() {
      return clone(db().activity);
    },
    async markActivityRead() {
      const now = new Date().toISOString();
      for (const a of db().activity) if (!a.read_at) a.read_at = now;
      persist();
    },
    async uploadAvatar(file) {
      return resizeToDataUrl(file, 320);
    },
    async deleteAccount() {
      this.reset();
    },
    reset() {
      started = false;
      for (const t of timers) clearTimeout(t);
      timers.clear();
      try {
        localStorage.removeItem(KEY);
      } catch {
        // ignore
      }
      state = null;
    },
    sendTyping() {},
    subscribe(handler) {
      listeners.add(handler);
      // A few people are around when you arrive.
      handler({ type: "online", ids: ["d04", "d05", "d06", "d11", "d17"] });
      if (!started) {
        started = true;
        for (const other of db().pendingAccept || []) scheduleAccept(other, 9000);
      }
      return () => {
        listeners.delete(handler);
      };
    },
  };
}

export function resizeToDataUrl(file, size) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, size / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That file isn't an image we can read. Try a JPG or PNG."));
    };
    img.src = url;
  });
}
