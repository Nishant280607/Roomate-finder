import { supabase } from "../lib/supabase";

export const initialNotifications = [
  {
    id: 1,
    type: "match",
    title: "New match found",
    message: "You and Sarah Johnson have a 94% compatibility score.",
    time: "5 minutes ago",
    read: false,
    icon: "✦",
  },
  {
    id: 2,
    type: "message",
    title: "New message",
    message: "David Wilson sent you a message.",
    time: "24 minutes ago",
    read: false,
    icon: "💬",
  },
  {
    id: 3,
    type: "profile",
    title: "Profile viewed",
    message: "Emma Davis viewed your profile.",
    time: "2 hours ago",
    read: false,
    icon: "◉",
  },
  {
    id: 4,
    type: "system",
    title: "Complete your profile",
    message: "Add more preferences to improve your matches.",
    time: "Yesterday",
    read: true,
    icon: "✓",
  },
  {
    id: 5,
    type: "match",
    title: "Another great match",
    message: "Michael Brown matches 89% of your preferences.",
    time: "Yesterday",
    read: true,
    icon: "✦",
  },
];

export const notificationService = {
  getStored(userId) {
    const key = userId ? `roomiefinder_notifs_${userId}` : "roomiefinder_notifs_guest";
    const cached = localStorage.getItem(key);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return initialNotifications;
  },

  async getNotifications(userId) {
    try {
      if (userId) {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((n) => ({
            id: n.id,
            type: n.type || "system",
            title: n.title,
            message: n.message,
            time: new Date(n.created_at).toLocaleDateString(),
            read: n.is_read,
            icon: n.type === "match" ? "✦" : n.type === "message" ? "💬" : "✓",
          }));
        }
      }
    } catch (err) {
      console.warn("getNotifications notice:", err);
    }
    return this.getStored(userId);
  },

  async markRead(userId, notifId) {
    const key = userId ? `roomiefinder_notifs_${userId}` : "roomiefinder_notifs_guest";
    const list = this.getStored(userId).map((n) =>
      n.id === notifId ? { ...n, read: true } : n
    );
    localStorage.setItem(key, JSON.stringify(list));

    if (userId) {
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("id", notifId)
          .eq("user_id", userId);
      } catch (err) {
        console.warn("markRead notice:", err);
      }
    }
    return list;
  },

  async markAllRead(userId) {
    const key = userId ? `roomiefinder_notifs_${userId}` : "roomiefinder_notifs_guest";
    const list = this.getStored(userId).map((n) => ({ ...n, read: true }));
    localStorage.setItem(key, JSON.stringify(list));

    if (userId) {
      try {
        await supabase
          .from("notifications")
          .update({ is_read: true })
          .eq("user_id", userId);
      } catch (err) {
        console.warn("markAllRead notice:", err);
      }
    }
    return list;
  },
};