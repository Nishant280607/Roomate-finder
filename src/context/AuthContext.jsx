import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SUPABASE_KEY, SUPABASE_URL, supabase } from "../lib/supabase";
import { GOOGLE_OFF_MESSAGE } from "../lib/authErrors";

const DEMO_FLAG = "rf-demo";
const DEMO_USER = { id: "me", email: "guest@demo.local", app_metadata: { provider: "demo" }, user_metadata: {} };

const AuthContext = createContext(null);

function readDemoFlag() {
  try {
    return localStorage.getItem(DEMO_FLAG) === "1";
  } catch {
    return false;
  }
}

function writeDemoFlag(on) {
  try {
    if (on) localStorage.setItem(DEMO_FLAG, "1");
    else localStorage.removeItem(DEMO_FLAG);
  } catch {
    // Private mode: the demo still runs for this tab.
  }
}

/** Asks Supabase which sign-in providers are switched on (null if unknown). */
async function isProviderEnabled(provider) {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY } });
    if (!res.ok) return null;
    const json = await res.json();
    return Boolean(json?.external?.[provider]);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(readDemoFlag);
  const [recovery, setRecovery] = useState(false);

  useEffect(() => {
    let alive = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (alive) setSession(data.session);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (!alive) return;
      setSession(next);
      setLoading(false);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (next) {
        writeDemoFlag(false);
        setDemo(false);
      }
    });

    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const enabled = await isProviderEnabled("google");
    if (enabled === false) throw new Error(GOOGLE_OFF_MESSAGE);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) throw error;
  }, []);

  const signInWithEmail = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUpWithEmail = useCallback(async ({ name, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    // Supabase hides "already registered" by returning a user with no identities.
    if (data.user && data.user.identities?.length === 0) {
      throw new Error("User already registered");
    }
    return { needsConfirmation: !data.session };
  }, []);

  const sendPasswordReset = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    setRecovery(false);
  }, []);

  const startDemo = useCallback(() => {
    writeDemoFlag(true);
    setDemo(true);
  }, []);

  const signOut = useCallback(async () => {
    if (demo) {
      writeDemoFlag(false);
      setDemo(false);
      return;
    }
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
    }
  }, [demo]);

  const value = useMemo(() => {
    const user = demo ? DEMO_USER : (session?.user ?? null);
    return {
      user,
      session,
      mode: demo ? "demo" : user ? "supabase" : null,
      provider: demo ? "demo" : (user?.app_metadata?.provider ?? null),
      loading: demo ? false : loading,
      recovery,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      updatePassword,
      startDemo,
      signOut,
    };
  }, [demo, session, loading, recovery, signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset, updatePassword, startDemo, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
