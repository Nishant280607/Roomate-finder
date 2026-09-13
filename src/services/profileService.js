import { supabase } from "../lib/supabase";

export const DEFAULT_PROFILE = {
  name: "Alex Morgan",
  age: 24,
  location: "Brooklyn, New York",
  occupation: "Software Developer",
  bio: "Easy-going, clean and respectful person looking for a comfortable place with a friendly roommate. I enjoy coding, coffee, fitness and exploring new places.",
  budget: "$900 - $1,300",
  moveIn: "October 2026",
  cleanliness: "Very Clean",
  socialLevel: "Moderately Social",
  sleepSchedule: "Night Owl",
  interests: ["Coding", "Coffee", "Gym", "Travel", "Movies", "Gaming"],
  image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
};

export const profileService = {
  async getProfile(userId) {
    if (!userId) return DEFAULT_PROFILE;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.warn("Supabase getProfile notice:", error.message);
      }

      const localCached = localStorage.getItem(`roomiefinder_profile_${userId}`);
      const parsedLocal = localCached ? JSON.parse(localCached) : {};

      if (data) {
        return {
          ...DEFAULT_PROFILE,
          ...parsedLocal,
          ...data,
          id: userId,
        };
      }

      return {
        ...DEFAULT_PROFILE,
        ...parsedLocal,
        id: userId,
      };
    } catch (err) {
      console.warn("Profile service exception:", err);
      const localCached = localStorage.getItem(`roomiefinder_profile_${userId}`);
      return localCached ? JSON.parse(localCached) : { ...DEFAULT_PROFILE, id: userId };
    }
  },

  async updateProfile(userId, updates) {
    if (!userId) return null;

    const localCached = localStorage.getItem(`roomiefinder_profile_${userId}`);
    const existing = localCached ? JSON.parse(localCached) : { ...DEFAULT_PROFILE, id: userId };
    const merged = { ...existing, ...updates, id: userId };
    localStorage.setItem(`roomiefinder_profile_${userId}`, JSON.stringify(merged));

    try {
      const dbPayload = {
        id: userId,
        name: updates.name || existing.name,
        age: updates.age ? Number(updates.age) : existing.age,
        location: updates.location || existing.location,
        occupation: updates.occupation || existing.occupation,
        bio: updates.bio || existing.bio,
        lifestyle: updates.lifestyle || existing.lifestyle || updates.cleanliness || existing.cleanliness,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("profiles")
        .upsert(dbPayload, { onConflict: "id" })
        .select()
        .single();

      if (error) {
        console.warn("Supabase updateProfile notice:", error.message);
      }

      return merged;
    } catch (err) {
      console.warn("Update profile exception:", err);
      return merged;
    }
  },

  async createProfile(userId, initialData = {}) {
    if (!userId) return null;
    return this.updateProfile(userId, {
      ...DEFAULT_PROFILE,
      ...initialData,
    });
  },
};