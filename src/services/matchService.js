import { supabase } from "../lib/supabase";
import { roommateData } from "../data/mockData";

const INITIAL_MATCHES = [
  roommateData[0], // Sarah Johnson
  roommateData[1], // David Wilson
  roommateData[2], // Emma Davis
];

export const matchService = {
  async getMatches(userId) {
    try {
      if (userId) {
        const { data, error } = await supabase
          .from("matches")
          .select("*")
          .eq("user_id", userId);

        if (!error && data && data.length > 0) {
          const matchedIds = new Set(data.map((m) => String(m.matched_user_id)));
          const matchedRoommates = roommateData.filter((r) =>
            matchedIds.has(String(r.id))
          );
          if (matchedRoommates.length > 0) {
            return matchedRoommates;
          }
        }
      }
    } catch (err) {
      console.warn("matchService getMatches notice:", err);
    }

    const localCached = localStorage.getItem(
      userId ? `roomiefinder_matches_${userId}` : "roomiefinder_matches_guest"
    );
    if (localCached) {
      try {
        return JSON.parse(localCached);
      } catch (e) {}
    }

    return INITIAL_MATCHES;
  },

  async addMatch(userId, roommate) {
    const current = await this.getMatches(userId);
    if (!current.some((m) => String(m.id) === String(roommate.id))) {
      const updated = [roommate, ...current];
      localStorage.setItem(
        userId ? `roomiefinder_matches_${userId}` : "roomiefinder_matches_guest",
        JSON.stringify(updated)
      );

      if (userId) {
        try {
          await supabase.from("matches").insert({
            user_id: userId,
            matched_user_id: String(roommate.id),
            status: "accepted",
          });
        } catch (err) {
          console.warn("matchService insert notice:", err);
        }
      }
      return updated;
    }
    return current;
  },

  async unmatch(userId, roommateId) {
    const current = await this.getMatches(userId);
    const updated = current.filter((m) => String(m.id) !== String(roommateId));
    localStorage.setItem(
      userId ? `roomiefinder_matches_${userId}` : "roomiefinder_matches_guest",
      JSON.stringify(updated)
    );

    if (userId) {
      try {
        await supabase
          .from("matches")
          .delete()
          .eq("user_id", userId)
          .eq("matched_user_id", String(roommateId));
      } catch (err) {
        console.warn("matchService delete notice:", err);
      }
    }
    return updated;
  },
};