import { supabase } from "../lib/supabase";
import { PROFILE_FIELDS } from "../lib/options";
import { resizeToDataUrl } from "./demoApi";

const MEMBER_COLUMNS = [
  "id",
  ...PROFILE_FIELDS,
  "created_at",
  "updated_at",
  "last_seen",
].join(", ");

function only(patch) {
  const out = {};
  for (const key of PROFILE_FIELDS) if (key in patch) out[key] = patch[key];
  return out;
}

function must({ data, error }) {
  if (error) throw error;
  return data;
}

async function dataUrlToBlob(dataUrl) {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function createSupabaseApi(user) {
  const uid = user.id;
  let typingChannel = null;

  return {
    mode: "supabase",
    uid,

    async loadMe() {
      let row = must(await supabase.from("members").select(MEMBER_COLUMNS).eq("id", uid).maybeSingle());
      if (!row) {
        // Accounts created before the database was set up have no row yet.
        const meta = user.user_metadata || {};
        row = must(
          await supabase
            .from("members")
            .insert({
              id: uid,
              full_name: meta.full_name || meta.name || (user.email || "").split("@")[0] || "",
              avatar_url: meta.avatar_url || meta.picture || null,
            })
            .select(MEMBER_COLUMNS)
            .single(),
        );
      }
      supabase.from("members").update({ last_seen: new Date().toISOString() }).eq("id", uid).then(() => {});
      return row;
    },

    async saveMe(patch) {
      return must(await supabase.from("members").update(only(patch)).eq("id", uid).select(MEMBER_COLUMNS).single());
    },

    async loadMembers() {
      return must(
        await supabase
          .from("members")
          .select(MEMBER_COLUMNS)
          .neq("id", uid)
          .eq("onboarded", true)
          .order("last_seen", { ascending: false })
          .limit(500),
      );
    },

    async loadConnections() {
      return must(
        await supabase
          .from("connections")
          .select("*")
          .or(`requester_id.eq.${uid},addressee_id.eq.${uid}`)
          .order("created_at", { ascending: false }),
      );
    },

    async connect(other, note = "") {
      const res = await supabase
        .from("connections")
        .insert({ requester_id: uid, addressee_id: other, note: note.trim() })
        .select("*")
        .single();
      if (res.error?.code === "23505") {
        // A request already exists between you (maybe they just sent one).
        return must(
          await supabase
            .from("connections")
            .select("*")
            .or(`and(requester_id.eq.${uid},addressee_id.eq.${other}),and(requester_id.eq.${other},addressee_id.eq.${uid})`)
            .single(),
        );
      }
      return must(res);
    },

    async respond(connId, accept) {
      if (!accept) {
        must(await supabase.from("connections").delete().eq("id", connId).eq("addressee_id", uid));
        return null;
      }
      return must(
        await supabase
          .from("connections")
          .update({ status: "accepted" })
          .eq("id", connId)
          .eq("addressee_id", uid)
          .select("*")
          .single(),
      );
    },

    async removeConnection(connId) {
      must(await supabase.from("connections").delete().eq("id", connId));
    },

    async loadSaved() {
      const rows = must(
        await supabase.from("saved_members").select("member_id").eq("user_id", uid).order("created_at", { ascending: false }),
      );
      return rows.map((r) => r.member_id);
    },

    async setSaved(memberId, on) {
      if (on) {
        const res = await supabase.from("saved_members").insert({ user_id: uid, member_id: memberId });
        if (res.error && res.error.code !== "23505") throw res.error;
      } else {
        must(await supabase.from("saved_members").delete().eq("user_id", uid).eq("member_id", memberId));
      }
    },

    async loadMessages() {
      const rows = must(
        await supabase
          .from("chat_messages")
          .select("*")
          .or(`sender_id.eq.${uid},recipient_id.eq.${uid}`)
          .order("created_at", { ascending: false })
          .limit(1500),
      );
      return rows.reverse();
    },

    async sendMessage(to, body) {
      return must(
        await supabase.from("chat_messages").insert({ sender_id: uid, recipient_id: to, body }).select("*").single(),
      );
    },

    async markRead(fromId) {
      must(
        await supabase
          .from("chat_messages")
          .update({ read_at: new Date().toISOString() })
          .eq("recipient_id", uid)
          .eq("sender_id", fromId)
          .is("read_at", null),
      );
    },

    async loadActivity() {
      return must(
        await supabase.from("activity").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(60),
      );
    },

    async markActivityRead() {
      must(
        await supabase.from("activity").update({ read_at: new Date().toISOString() }).eq("user_id", uid).is("read_at", null),
      );
    },

    async uploadAvatar(file) {
      const blob = await dataUrlToBlob(await resizeToDataUrl(file, 512));
      const path = `${uid}/avatar-${Date.now()}.jpg`;
      must(await supabase.storage.from("avatars").upload(path, blob, { contentType: "image/jpeg", upsert: true }));
      return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    },

    async deleteAccount() {
      must(await supabase.rpc("rf_delete_account"));
      await supabase.auth.signOut();
    },

    sendTyping(to) {
      typingChannel?.send({ type: "broadcast", event: "typing", payload: { from: uid, to } });
    },

    subscribe(handler, { showOnline = true } = {}) {
      const changes = supabase
        .channel(`rf-changes-${uid}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "connections" }, () => handler({ type: "connections" }))
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat_messages", filter: `recipient_id=eq.${uid}` },
          (p) => handler({ type: "message", row: p.new }),
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "chat_messages", filter: `sender_id=eq.${uid}` },
          (p) => handler({ type: "message-update", row: p.new }),
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "activity", filter: `user_id=eq.${uid}` },
          (p) => handler({ type: "activity", kind: p.new.kind, actor: p.new.actor_id }),
        )
        .on("postgres_changes", { event: "*", schema: "public", table: "members" }, (p) => {
          if (p.new?.id !== uid) handler({ type: "members" });
        })
        .subscribe();

      const presence = supabase.channel("rf-online", { config: { presence: { key: uid } } });
      presence
        .on("presence", { event: "sync" }, () => handler({ type: "online", ids: Object.keys(presence.presenceState()) }))
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED" && showOnline) await presence.track({ at: Date.now() });
        });

      typingChannel = supabase.channel("rf-typing");
      typingChannel
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          if (payload?.to === uid) handler({ type: "typing", from: payload.from });
        })
        .subscribe();

      return () => {
        supabase.removeChannel(changes);
        supabase.removeChannel(presence);
        if (typingChannel) supabase.removeChannel(typingChannel);
        typingChannel = null;
      };
    },
  };
}
