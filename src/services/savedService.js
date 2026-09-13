import { supabase } from "../lib/supabase";
import { roommateData } from "../data/mockData";

const INITIAL_SAVED = [
  roommateData[0], // Sarah Johnson
  roommateData[1], // David Wilson
  roommateData[3], // Michael Brown
];

export const savedService = {
  async getSaved(userId) {
    try {
      if (userId) {
        const { data, error } = await supabase
          .from("saved_profiles")
          .select("*")
          .eq("user_id", userId);

        if (!error && data && data.length > 0) {
          const savedIds = new Set(data.map((s) => String(s.saved_user_id)));
          const savedRoommates = roommateData.filter((r) =>
            savedIds.has(String(r.id))
          );
          if (savedRoommates.length > 0) {
            return savedRoommates;
          }
        }
      }
    } catch (err) {
      console.warn("savedService getSaved notice:", err);
    }

    const localCached = localStorage.getItem(
      userId ? `roomiefinder_saved_${userId}` : "roomiefinder_saved_guest"
    );
    if (localCached) {
      try {
        return JSON.parse(localCached);
      } catch (e) {}
    }

    return INITIAL_SAVED;
  },

  async toggleSave(userId, roommate) {
    const current = await this.getSaved(userId);
    const exists = current.some((r) => String(r.id) === String(roommate.id));
    let updated;

    if (exists) {
      updated = current.filter((r) => String(r.id) !== String(roommate.id));
      if (userId) {
        try {
          await supabase
            .from("saved_profiles")
            .delete()
            .eq("user_id", userId)
            .eq("saved_user_id", String(roommate.id));
        } catch (err) {
          console.warn("savedService delete notice:", err);
        }
      }
    } else {
      updated = [roommate, ...current];
      if (userId) {
        try {
          await supabase.from("saved_profiles").insert({
            user_id: userId,
            saved_user_id: String(roommate.id),
          });
        } catch (err) {
          console.warn("savedService insert notice:", err);
        }
      }
    }

    localStorage.setItem(
      userId ? `roomiefinder_saved_${userId}` : "roomiefinder_saved_guest",
      JSON.stringify(updated)
    );

    return { saved: !exists, list: updated };
  },

  async isSaved(userId, roommateId) {
    const list = await this.getSaved(userId);
    return list.some((r) => String(r.id) === String(roommateId));
  },
};