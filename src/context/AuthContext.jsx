import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SUPABASE_KEY, SUPABASE_URL, supabase } from "../lib/supabase";
import { friendly, GOOGLE_OFF_MESSAGE, isAlreadyRegistered, isInvalidCredentials, MESSAGES } from "../lib/authErrors";

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

let providersPromise = null;

/** Asks the sign-in service which providers are switched on. Resolves to null if it can't tell. */
function loadProviders() {
  if (!providersPromise) {
    providersPromise = fetch(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: SUPABASE_KEY } })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => json?.external ?? null)
      .catch(() => null);
  }
  return providersPromise;
}

// Setup hints go to the browser console only, never on screen.
const GOOGLE_SETUP_HINT =
  "[RoomieFinder] Google sign-in is off, so the Google buttons won't work yet. Turn it on in Supabase: Authentication → Sign In / Providers → Google.";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(readDemoFlag);
  const [recovery, setRecovery] = useState(false);
  // While the door-opening animation plays, sign-in pages hold off redirecting.
  const [holding, setHolding] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(null);

  useEffect(() => {
    let alive = true;
    loadProviders().then((external) => {
      if (!alive || !external) return;
      setGoogleEnabled(Boolean(external.google));
      if (!external.google) console.warn(GOOGLE_SETUP_HINT);
    });
    return () => {
      alive = false;
    };
  }, []);

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
    const external = await loadProviders();
    if (external && !external.google) {
      console.warn(GOOGLE_SETUP_HINT);
      throw new Error(GOOGLE_OFF_MESSAGE);
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) throw error;
  }, []);

  /** "none" | "password" | "google" | "both", or null if it can't tell. */
  const emailStatus = useCallback(async (email) => {
    try {
      const { data, error } = await supabase.rpc("rf_email_status", { p_email: email });
      return error ? null : data;
    } catch {
      return null;
    }
  }, []);

  const signInWithEmail = useCallback(
    async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) return;
      if (isInvalidCredentials(error)) {
        const status = await emailStatus(email);
        if (status === "none") throw friendly(MESSAGES.noAccount);
        if (status === "google") throw friendly(MESSAGES.usesGoogle);
        if (status) throw friendly(MESSAGES.wrongPassword);
      }
      throw error;
    },
    [emailStatus],
  );

  const signUpWithEmail = useCallback(async ({ name, email, password }) => {
    const status = await emailStatus(email);
    if (status === "google") throw friendly(MESSAGES.alreadyRegisteredGoogle);
    if (status === "password" || status === "both") throw friendly(MESSAGES.alreadyRegistered);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw isAlreadyRegistered(error) ? friendly(MESSAGES.alreadyRegistered) : error;
    // Supabase hides "already registered" by returning a user with no identities.
    if (data.user && data.user.identities?.length === 0) throw friendly(MESSAGES.alreadyRegistered);
    return { needsConfirmation: !data.session };
  }, [emailStatus]);

  const sendPasswordReset = useCallback(async (email) => {
    const status = await emailStatus(email);
    // Google accounts can get a code too, so they can add a password as a backup.
    if (status === "none") throw friendly(MESSAGES.noAccount);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }, [emailStatus]);

  /** Checks the code from a password-reset email. On success the person is signed in. */
  const verifyRecoveryCode = useCallback(async (email, token) => {
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "recovery" });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    setRecovery(false);
  }, []);

  const hold = useCallback(() => setHolding(true), []);
  const release = useCallback(() => setHolding(false), []);

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
      holding,
      hold,
      release,
      googleEnabled,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      verifyRecoveryCode,
      updatePassword,
      startDemo,
      signOut,
    };
  }, [demo, session, loading, recovery, holding, hold, release, googleEnabled, signInWithGoogle, signInWithEmail, signUpWithEmail, sendPasswordReset, verifyRecoveryCode, updatePassword, startDemo, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
