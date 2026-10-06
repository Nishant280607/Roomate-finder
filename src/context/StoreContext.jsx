import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { createDemoApi } from "../data/demoApi";
import { createSupabaseApi } from "../data/supabaseApi";
import { isMissingSchema } from "../lib/supabase";
import { connectionMessage } from "../lib/authErrors";
import { computeMatch, fitsPreference } from "../lib/match";
import { firstName } from "../lib/format";

const StoreContext = createContext(null);
const NONE = { state: "none", conn: null };

// Shown on screen: says what failed and why, in plain words. The raw error goes to the console.
const CHECKS = [
  [/age/, "Age must be between 16 and 99."],
  [/rent_order|rent/, "Your minimum rent must be lower than your maximum."],
  [/bio/, "Your bio can be up to 600 characters."],
  [/full_name/, "Your name can be up to 80 characters."],
  [/occupation/, "What you do can be up to 80 characters."],
  [/body/, "Messages can't be empty or longer than 2,000 characters."],
  [/note/, "Notes can be up to 300 characters."],
  [/not_self/, "You can't connect with yourself."],
];

function errorText(error, fallback = "That didn't work.") {
  const message = String(error?.message || error || "");
  const code = String(error?.code || "");
  if (message) console.error("[RoomieFinder]", code, message);
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(message)) return connectionMessage();
  if (/jwt expired|session.*expired|refresh token/i.test(message) || code === "PGRST301") return "Your session has expired. Please sign in again.";
  if (/row-level security|permission denied/i.test(message) || code === "42501") return `${fallback} You need to be connected with this person first.`;
  if (code === "23514" || /violates check constraint/i.test(message)) {
    const name = message.match(/constraint "([^"]+)"/)?.[1] || "";
    return CHECKS.find(([pattern]) => pattern.test(name))?.[1] || `${fallback} Some details aren't valid.`;
  }
  if (code === "23503") return `${fallback} This person's account no longer exists.`;
  if (/exceeded the maximum allowed size|payload too large/i.test(message)) return "That photo is too big. Choose a smaller one.";
  if (/mime type|isn't an image/i.test(message)) return "That file isn't a photo we can use. Choose a JPG or PNG.";
  if (/could not find the .* column|schema cache/i.test(message)) return `${fallback} This feature isn't available yet.`;
  if (/only message people you're connected with|request is no longer available/i.test(message)) return message;
  return `${fallback} Please try again.`;
}

async function fetchEverything(api) {
  try {
    const me = await api.loadMe();
    const [members, connections, saved, messages, activity] = await Promise.all([
      api.loadMembers(),
      api.loadConnections(),
      api.loadSaved(),
      api.loadMessages(),
      api.loadActivity(),
    ]);
    return { status: "ready", data: { me, members, connections, saved, messages, activity } };
  } catch (error) {
    if (isMissingSchema(error)) return { status: "needs-setup" };
    return { status: "error", error: errorText(error, "We couldn't load your matches.") };
  }
}

export function StoreProvider({ children }) {
  const { user, mode, signOut } = useAuth();
  const toast = useToast();
  const userId = user?.id;

  const api = useMemo(() => {
    if (!mode || !userId) return null;
    return mode === "demo" ? createDemoApi() : createSupabaseApi(user);
    // The API only depends on who is signed in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, userId]);

  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState(null);
  const [me, setMe] = useState(null);
  const [members, setMembers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [saved, setSaved] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activity, setActivity] = useState([]);
  const [online, setOnline] = useState(() => new Set());
  const [typing, setTyping] = useState({});
  const membersRef = useRef(members);

  useEffect(() => {
    membersRef.current = members;
  }, [members]);

  const apply = useCallback((result) => {
    if (result.status === "ready") {
      const { me: meRow, members: m, connections: c, saved: s, messages: msg, activity: act } = result.data;
      setMe(meRow);
      setMembers(m);
      setConnections(c);
      setSaved(s);
      setMessages(msg);
      setActivity(act);
      setLoadError(null);
    } else {
      setLoadError(result.error ?? null);
    }
    setStatus(result.status);
  }, []);

  useEffect(() => {
    if (!api) return undefined;
    let cancelled = false;
    fetchEverything(api).then((result) => {
      if (!cancelled) apply(result);
    });
    return () => {
      cancelled = true;
    };
  }, [api, apply]);

  const retry = useCallback(async () => {
    setStatus("loading");
    apply(await fetchEverything(api));
  }, [api, apply]);

  const showOnline = me?.show_online !== false;

  // Live updates: requests, messages, activity, people joining, who's online.
  useEffect(() => {
    if (!api || status !== "ready") return undefined;
    const nameOf = (id) => firstName(membersRef.current.find((m) => m.id === id)?.full_name || "Someone");
    const typingTimers = new Map();

    const unsubscribe = api.subscribe(
      (event) => {
        switch (event.type) {
          case "connections":
            api.loadConnections().then(setConnections).catch(() => {});
            break;
          case "message": {
            const row = event.row;
            setMessages((list) => (list.some((m) => m.id === row.id) ? list : [...list, row]));
            setTyping((t) => {
              if (!t[row.sender_id]) return t;
              const next = { ...t };
              delete next[row.sender_id];
              return next;
            });
            if (window.location.pathname !== `/messages/${row.sender_id}`) toast(`New message from ${nameOf(row.sender_id)}`);
            break;
          }
          case "message-update":
            setMessages((list) => list.map((m) => (m.id === event.row.id ? { ...m, ...event.row } : m)));
            break;
          case "activity":
            Promise.all([api.loadMembers(), api.loadConnections(), api.loadActivity()])
              .then(([m, c, a]) => {
                membersRef.current = m;
                setMembers(m);
                setConnections(c);
                setActivity(a);
                if (event.kind === "request") toast(`${nameOf(event.actor)} wants to connect`);
                if (event.kind === "accepted") toast(`${nameOf(event.actor)} accepted your request`);
              })
              .catch(() => {});
            break;
          case "members":
            api.loadMembers().then(setMembers).catch(() => {});
            break;
          case "online":
            setOnline(new Set(event.ids));
            break;
          case "typing": {
            const from = event.from;
            setTyping((t) => ({ ...t, [from]: true }));
            clearTimeout(typingTimers.get(from));
            typingTimers.set(
              from,
              setTimeout(() => {
                setTyping((t) => {
                  const next = { ...t };
                  delete next[from];
                  return next;
                });
              }, 4000),
            );
            break;
          }
          default:
        }
      },
      { showOnline },
    );

    return () => {
      for (const t of typingTimers.values()) clearTimeout(t);
      unsubscribe?.();
    };
  }, [api, status, showOnline, toast]);

  /* ---------- Derived data ---------- */

  const memberById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);

  const people = useMemo(() => {
    if (!me) return [];
    return members
      .filter((m) => m.onboarded !== false)
      .map((m) => ({ ...m, match: computeMatch(me, m), allowed: fitsPreference(me, m) }));
  }, [me, members]);

  const relationTo = useCallback(
    (otherId) => {
      if (!me) return NONE;
      const conn = connections.find(
        (c) =>
          (c.requester_id === me.id && c.addressee_id === otherId) ||
          (c.addressee_id === me.id && c.requester_id === otherId),
      );
      if (!conn) return NONE;
      if (conn.status === "accepted") return { state: "connected", conn };
      return { state: conn.requester_id === me.id ? "outgoing" : "incoming", conn };
    },
    [connections, me],
  );

  const threads = useMemo(() => {
    if (!me) return [];
    const byOther = new Map();
    for (const m of messages) {
      const other = m.sender_id === me.id ? m.recipient_id : m.sender_id;
      const entry = byOther.get(other) || { otherId: other, last: null, unread: 0 };
      if (!entry.last || m.created_at >= entry.last.created_at) entry.last = m;
      if (m.recipient_id === me.id && !m.read_at) entry.unread += 1;
      byOther.set(other, entry);
    }
    return [...byOther.values()].sort((a, b) => (a.last.created_at < b.last.created_at ? 1 : -1));
  }, [messages, me]);

  const counts = useMemo(() => {
    const requests = me ? connections.filter((c) => c.status === "pending" && c.addressee_id === me.id).length : 0;
    const unreadMessages = threads.reduce((n, t) => n + t.unread, 0);
    const unreadActivity = activity.filter((a) => !a.read_at).length;
    return { requests, unreadMessages, unreadActivity };
  }, [connections, threads, activity, me]);

  /* ---------- Actions ---------- */

  const run = useCallback(
    async (fn, successText, failText) => {
      try {
        const result = await fn();
        if (successText) toast(successText);
        return result;
      } catch (error) {
        toast.error(errorText(error, failText));
        throw error;
      }
    },
    [toast],
  );

  const saveProfile = useCallback(
    (patch, successText) =>
      run(async () => {
        const row = await api.saveMe(patch);
        setMe(row);
        return row;
      }, successText, "Couldn't save your profile."),
    [api, run],
  );

  const uploadAvatar = useCallback(
    (file) =>
      run(async () => {
        const url = await api.uploadAvatar(file);
        const row = await api.saveMe({ avatar_url: url });
        setMe(row);
        return row;
      }, "Photo updated", "Couldn't upload your photo."),
    [api, run],
  );

  const respond = useCallback(
    (conn, accept) => {
      const name = firstName(memberById.get(conn.requester_id)?.full_name);
      return run(
        async () => {
          const row = await api.respond(conn.id, accept);
          setConnections((list) => (accept ? list.map((c) => (c.id === conn.id ? row : c)) : list.filter((c) => c.id !== conn.id)));
        },
        accept ? `You're connected with ${name}` : "Request declined",
        accept ? "Couldn't accept the request." : "Couldn't decline the request.",
      );
    },
    [api, run, memberById],
  );

  const connect = useCallback(
    (otherId, note) => {
      const rel = relationTo(otherId);
      if (rel.state === "incoming") return respond(rel.conn, true);
      return run(async () => {
        const row = await api.connect(otherId, note || "");
        setConnections((list) => [...list.filter((c) => c.id !== row.id), row]);
        return row;
      }, `Request sent to ${firstName(memberById.get(otherId)?.full_name)}`, "Couldn't send your request.");
    },
    [api, run, relationTo, memberById, respond],
  );

  const removeConnection = useCallback(
    (conn, successText = "Connection removed") =>
      run(async () => {
        await api.removeConnection(conn.id);
        setConnections((list) => list.filter((c) => c.id !== conn.id));
      }, successText, "Couldn't remove that connection."),
    [api, run],
  );

  const toggleSave = useCallback(
    (memberId) => {
      const on = !saved.includes(memberId);
      setSaved((list) => (on ? [memberId, ...list] : list.filter((id) => id !== memberId)));
      return run(async () => api.setSaved(memberId, on), on ? "Saved" : "Removed from saved", "Couldn't update your saved list.").catch(() => {
        setSaved((list) => (on ? list.filter((id) => id !== memberId) : [memberId, ...list]));
      });
    },
    [api, run, saved],
  );

  const sendMessage = useCallback(
    async (to, body, extra = {}) => {
      const text = body.trim();
      if (!text) return;
      const temp = {
        id: `tmp-${Date.now()}`,
        sender_id: me.id,
        recipient_id: to,
        body: text,
        kind: extra.kind || "text",
        payload: extra.payload ?? null,
        created_at: new Date().toISOString(),
        read_at: null,
        pending: true,
      };
      setMessages((list) => [...list, temp]);
      try {
        const row = await api.sendMessage(to, text, extra);
        setMessages((list) => {
          const withoutTemp = list.filter((m) => m.id !== temp.id);
          return withoutTemp.some((m) => m.id === row.id) ? withoutTemp : [...withoutTemp, row];
        });
      } catch (error) {
        setMessages((list) => list.map((m) => (m.id === temp.id ? { ...m, pending: false, failed: true } : m)));
        toast.error(errorText(error, "Message not sent."));
      }
    },
    [api, me, toast],
  );

  /** Optionally saves edited preferences to the profile, then posts them as a card. */
  const sharePreferences = useCallback(
    async (to, prefs, alsoSave) => {
      if (alsoSave) await saveProfile(prefs);
      await sendMessage(to, "Shared my preferences", { kind: "prefs", payload: prefs });
    },
    [saveProfile, sendMessage],
  );

  const discardMessage = useCallback((id) => setMessages((list) => list.filter((m) => m.id !== id)), []);

  const markThreadRead = useCallback(
    async (otherId) => {
      if (!me) return;
      const hasUnread = messages.some((m) => m.sender_id === otherId && m.recipient_id === me.id && !m.read_at);
      if (!hasUnread) return;
      const now = new Date().toISOString();
      setMessages((list) =>
        list.map((m) => (m.sender_id === otherId && m.recipient_id === me.id && !m.read_at ? { ...m, read_at: now } : m)),
      );
      try {
        await api.markRead(otherId);
      } catch {
        // Not critical; it will be retried next time the thread opens.
      }
    },
    [api, me, messages],
  );

  const markActivityRead = useCallback(async () => {
    if (!activity.some((a) => !a.read_at)) return;
    const now = new Date().toISOString();
    setActivity((list) => list.map((a) => (a.read_at ? a : { ...a, read_at: now })));
    try {
      await api.markActivityRead();
    } catch {
      // Not critical.
    }
  }, [api, activity]);

  const sendTyping = useCallback((to) => api?.sendTyping?.(to), [api]);

  const deleteAccount = useCallback(async () => {
    await run(() => api.deleteAccount(), null, "Couldn't delete your account.");
    await signOut();
  }, [api, run, signOut]);

  const resetDemo = useCallback(async () => {
    if (api?.mode !== "demo") return;
    api.reset();
    await retry();
    toast("Demo reset");
  }, [api, retry, toast]);

  const value = {
    mode,
    status,
    loadError,
    retry,
    me,
    members,
    people,
    memberById,
    connections,
    saved,
    messages,
    threads,
    activity,
    online,
    typing,
    counts,
    relationTo,
    saveProfile,
    uploadAvatar,
    connect,
    respond,
    removeConnection,
    toggleSave,
    sendMessage,
    sharePreferences,
    discardMessage,
    markThreadRead,
    markActivityRead,
    sendTyping,
    deleteAccount,
    resetDemo,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
