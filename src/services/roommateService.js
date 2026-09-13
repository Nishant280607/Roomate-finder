import { supabase } from "../lib/supabase";
import { roommateData } from "../data/mockData";

export const roommateService = {
  async getRoommates(currentUserId) {
    try {
      let query = supabase.from("profiles").select("*");
      if (currentUserId) {
        query = query.neq("id", currentUserId);
      }
      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        const dbRoommates = data.map((item, index) => {
          const fallback = roommateData[index % roommateData.length];
          return {
            id: item.id,
            name: item.name || fallback.name,
            age: item.age || fallback.age,
            location: item.location || fallback.location,
            occupation: item.occupation || fallback.occupation,
            compatibility: 88 + ((index * 3) % 11),
            image: item.image || fallback.image,
            interests: item.interests || fallback.interests,
            lifestyle: item.lifestyle || fallback.lifestyle,
            bio: item.bio || fallback.lifestyle,
          };
        });

        const existingNames = new Set(dbRoommates.map(r => (r.name || "").toLowerCase()));
        const remainingMock = roommateData.filter(
          m => !existingNames.has((m.name || "").toLowerCase())
        );

        return [...dbRoommates, ...remainingMock];
      }
    } catch (err) {
      console.warn("Roommate service notice:", err);
    }

    return roommateData;
  },

  async getRoommateById(id) {
    const all = await this.getRoommates();
    return all.find(r => String(r.id) === String(id)) || null;
  }
};