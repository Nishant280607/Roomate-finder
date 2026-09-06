import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { profileService, DEFAULT_PROFILE } from "../services/profileService";

const AuthContext = createContext({
  user: null,
  session: null,
  profile: DEFAULT_PROFILE,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  changePassword: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  async function loadUserProfile(userId) {
    if (!userId) {
      setProfile(DEFAULT_PROFILE);
      return;
    }
    const prof = await profileService.getProfile(userId);
    setProfile(prof || { ...DEFAULT_PROFILE, id: userId });
  }

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await loadUserProfile(initialSession.user.id);
        }
      } catch (err) {
        console.warn("Auth initialization notice:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await loadUserProfile(currentUser.id);
      } else {
        setProfile(DEFAULT_PROFILE);
      }

      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data?.user) {
      setUser(data.user);
      setSession(data.session);
      await loadUserProfile(data.user.id);
    }

    return data;
  }

  async function signup({ name, email, password }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) throw error;

    if (data?.user) {
      // Upsert profile in Supabase profiles table
      try {
        await profileService.createProfile(data.user.id, {
          name,
        });
      } catch (profileErr) {
        console.warn("Profile creation during signup notice:", profileErr);
      }
    }

    return data;
  }

  async function logout() {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Sign out notice:", err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(DEFAULT_PROFILE);
    }
  }

  async function updateProfile(updates) {
    if (!user) return null;
    const updated = await profileService.updateProfile(user.id, updates);
    setProfile(updated);
    return updated;
  }

  async function changePassword(newPassword) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  }

  async function refreshProfile() {
    if (user) {
      await loadUserProfile(user.id);
    }
  }

  const value = {
    user,
    session,
    profile,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}