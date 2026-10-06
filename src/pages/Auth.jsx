import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CircleAlert, MailCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Brand, GoogleMark, Splash } from "../components/Bits";
import { friendlyAuthError } from "../lib/authErrors";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* The door on the left of every sign-in screen.
   closed → ajar (form filled in) → open (signed in) · locked (wrong details) */
function useDoor() {
  const [moment, setMoment] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const swingOpen = useCallback(async () => {
    clearTimeout(timer.current);
    setMoment("open");
    await wait(reducedMotion() ? 0 : 1150);
  }, []);

  const rattle = useCallback(() => {
    clearTimeout(timer.current);
    setMoment("locked");
    timer.current = setTimeout(() => setMoment(null), 550);
  }, []);

  return { moment, swingOpen, rattle };
}

function Door({ plate, caption, state }) {
  const size = plate.length > 18 ? 0.82 : plate.length > 12 ? 0.95 : 1.15;
  return (
    <div className="door-side">
      <Brand tone="light" />
      <div className="door-scene" aria-hidden>
        <div className={`door is-${state}`}>
          <div className="door-leaf">
            <div className="door-panels">
              <span />
              <span />
            </div>
            <div className="door-plate">
              <span className="door-plate-text" style={{ fontSize: `${size}em` }}>
                {plate}
              </span>
            </div>
            <span className="door-knob" />
            <span className="door-peephole" />
          </div>
        </div>
        <div className="door-spill" />
      </div>
      <p className="door-caption">{caption}</p>
    </div>
  );
}

function AuthFrame({ plate, caption, door = "closed", children }) {
  return (
    <div className={`auth ${door === "open" ? "is-entering" : ""}`}>
      <Door plate={plate} caption={caption} state={door} />
      <main className="auth-side">
        <div className="auth-box">{children}</div>
      </main>
    </div>
  );
}

function Notice({ tone = "error", children }) {
  return (
    <div className={`notice notice-${tone}`} role={tone === "error" ? "alert" : "status"}>
      {tone === "error" ? <CircleAlert size={18} aria-hidden /> : <MailCheck size={18} aria-hidden />}
      <div>{children}</div>
    </div>
  );
}

/** "Continue with Google" plus the "or" divider. */
function GoogleBlock({ label, divider, door }) {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <button
        type="button"
        className="btn btn-google btn-lg btn-block"
        disabled={busy}
        onClick={async () => {
          setError("");
          setBusy(true);
          door.swingOpen();
          try {
            await signInWithGoogle();
          } catch (e) {
            setError(friendlyAuthError(e));
            door.rattle();
            setBusy(false);
          }
        }}
      >
        {busy ? <span className="spinner" aria-hidden /> : <GoogleMark />}
        {label}
      </button>
      {error && <Notice>{error}</Notice>}
      <div className="divider-or">{divider}</div>
    </>
  );
}

function PasswordInput({ id, value, onChange, autoComplete }) {
  const [shown, setShown] = useState(false);
  return (
    <div className="input-with-action">
      <input
        id={id}
        className="input"
        type={shown ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
      />
      <button type="button" onClick={() => setShown((s) => !s)} aria-pressed={shown}>
        {shown ? "Hide" : "Show"}
      </button>
    </div>
  );
}

/** Signs in, then lets the door swing open before the page moves on. */
function useWalkIn(door) {
  const { hold, release } = useAuth();
  useEffect(() => release, [release]);
  return useCallback(
    async (signIn) => {
      hold();
      try {
        const result = await signIn();
        if (result?.stayHere) {
          release();
          return result;
        }
        await door.swingOpen();
        release();
        return result;
      } catch (error) {
        release();
        door.rattle();
        throw error;
      }
    },
    [door, hold, release],
  );
}

function DemoLink({ onClick }) {
  return (
    <button type="button" className="text-link" onClick={onClick}>
      explore the demo
    </button>
  );
}

/** Forgot password: email → 6-digit code from the email + new password → signed in. */
function ForgotPassword({ initialEmail, onBack }) {
  const { sendPasswordReset, verifyRecoveryCode, updatePassword } = useAuth();
  const door = useDoor();
  const walkIn = useWalkIn(door);
  const [email, setEmail] = useState(initialEmail);
  const [step, setStep] = useState("email");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return undefined;
    const t = setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const token = code.replace(/\s/g, "");
  const ready = step === "email" ? EMAIL_RE.test(email.trim()) : /^\d{6,10}$/.test(token) && password.length >= 8;
  const doorState = door.moment || (ready || busy ? "ajar" : "closed");

  async function sendCode(e) {
    e?.preventDefault();
    setError("");
    if (!EMAIL_RE.test(email.trim())) {
      door.rattle();
      return setError("Enter a valid email address.");
    }
    setBusy(true);
    try {
      await sendPasswordReset(email.trim());
      setStep("code");
      setCode("");
      setCooldown(60);
    } catch (err) {
      setError(friendlyAuthError(err));
      door.rattle();
    } finally {
      setBusy(false);
    }
  }

  async function resetWithCode(e) {
    e.preventDefault();
    setError("");
    const problem = !/^\d{6,10}$/.test(token)
      ? "Enter the code from the email."
      : password.length < 8
        ? "Use a new password with at least 8 characters."
        : "";
    if (problem) {
      door.rattle();
      return setError(problem);
    }
    setBusy(true);
    try {
      await walkIn(async () => {
        await verifyRecoveryCode(email.trim(), token);
        await updatePassword(password);
      });
    } catch (err) {
      setError(friendlyAuthError(err));
      setBusy(false);
    }
  }

  if (step === "email") {
    return (
      <AuthFrame plate="Locked out?" caption="It happens. We'll email you a code to set a new password." door={doorState}>
        <h1 className="h-page">Reset your password</h1>
        <p className="muted">Enter the email you signed up with. We'll send you a 6-digit code.</p>
        <form className="auth-form" onSubmit={sendCode} noValidate>
          <label className="field">
            <span className="field-label">Email</span>
            <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          {error && <Notice>{error}</Notice>}
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
            {busy && <span className="spinner" aria-hidden />} Send code
          </button>
        </form>
        <p className="auth-foot">
          <button type="button" className="text-link" onClick={onBack}>
            Back to sign in
          </button>
        </p>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame plate="Almost in" caption="Type the code from your email and choose a new password." door={doorState}>
      <h1 className="h-page">Check your email</h1>
      <p className="muted">
        If there's an account for <strong>{email.trim()}</strong>, we've sent it a code. The email also has a link you can use instead.
      </p>
      <form className="auth-form" onSubmit={resetWithCode} noValidate>
        <label className="field">
          <span className="field-label">Code from the email</span>
          <input
            className="input code-input num"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={10}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^\d\s]/g, ""))}
            required
          />
        </label>
        <div className="field">
          <label className="field-label" htmlFor="reset-password">
            New password
          </label>
          <PasswordInput id="reset-password" value={password} onChange={setPassword} autoComplete="new-password" />
          <span className="field-hint">At least 8 characters.</span>
        </div>
        {error && <Notice>{error}</Notice>}
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
          {busy && <span className="spinner" aria-hidden />} Reset password and sign in
        </button>
      </form>
      <p className="auth-foot">
        Didn't get it? Check your spam folder, or{" "}
        <button type="button" className="text-link" disabled={cooldown > 0 || busy} onClick={() => sendCode()}>
          {cooldown > 0 ? `send a new code in ${cooldown}s` : "send a new code"}
        </button>
        .{" "}
        <button
          type="button"
          className="text-link"
          onClick={() => {
            setStep("email");
            setError("");
          }}
        >
          Use a different email
        </button>
      </p>
    </AuthFrame>
  );
}

export function Login() {
  const { signInWithEmail, startDemo } = useAuth();
  const door = useDoor();
  const walkIn = useWalkIn(door);
  const [forgot, setForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const ready = EMAIL_RE.test(email.trim()) && password.length > 0;
  const doorState = door.moment || (ready || busy ? "ajar" : "closed");

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!EMAIL_RE.test(email.trim())) {
      door.rattle();
      return setError("Enter a valid email address.");
    }
    setBusy(true);
    try {
      await walkIn(() => signInWithEmail(email.trim(), password));
    } catch (err) {
      setError(friendlyAuthError(err));
      setBusy(false);
    }
  }

  if (forgot) {
    return (
      <ForgotPassword
        initialEmail={email}
        onBack={() => {
          setForgot(false);
          setError("");
        }}
      />
    );
  }

  return (
    <AuthFrame plate="Welcome back" caption="Sign in to see who's replied and who's new in your city." door={doorState}>
      <h1 className="h-page">Sign in</h1>
      <GoogleBlock label="Continue with Google" divider="or use your email" door={door} />
      <form className="auth-form" onSubmit={submit} noValidate>
        <label className="field">
          <span className="field-label">Email</span>
          <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <div className="field">
          <span className="field-row-between">
            <label className="field-label" htmlFor="login-password">
              Password
            </label>
            <button
              type="button"
              className="text-link small"
              onClick={() => {
                setForgot(true);
                setError("");
              }}
            >
              Forgot password?
            </button>
          </span>
          <PasswordInput id="login-password" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
        {error && <Notice>{error}</Notice>}
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy || !password}>
          {busy && <span className="spinner" aria-hidden />} Sign in
        </button>
      </form>
      <p className="auth-foot">
        New here? <Link to="/signup">Create an account</Link>, or <DemoLink onClick={() => walkIn(async () => startDemo())} />.
      </p>
    </AuthFrame>
  );
}

export function Signup() {
  const { signUpWithEmail, startDemo } = useAuth();
  const door = useDoor();
  const walkIn = useWalkIn(door);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [checkInbox, setCheckInbox] = useState(false);

  const ready = Boolean(name.trim()) && EMAIL_RE.test(email.trim()) && password.length >= 8;
  const doorState = door.moment || (ready || busy ? "ajar" : "closed");

  async function submit(e) {
    e.preventDefault();
    setError("");
    const problem = !name.trim()
      ? "Add your name."
      : !EMAIL_RE.test(email.trim())
        ? "Enter a valid email address."
        : password.length < 8
          ? "Use a password with at least 8 characters."
          : "";
    if (problem) {
      door.rattle();
      return setError(problem);
    }
    setBusy(true);
    try {
      const result = await walkIn(async () => {
        const { needsConfirmation } = await signUpWithEmail({ name: name.trim(), email: email.trim(), password });
        return { stayHere: needsConfirmation };
      });
      if (result?.stayHere) {
        setCheckInbox(true);
        setBusy(false);
      }
    } catch (err) {
      setError(friendlyAuthError(err));
      setBusy(false);
    }
  }

  const plate = name.trim() || "Your name";

  if (checkInbox) {
    return (
      <AuthFrame plate={plate} caption="Almost there.">
        <h1 className="h-page">Check your inbox</h1>
        <Notice tone="ok">
          We sent a confirmation link to <strong>{email.trim()}</strong>. Open it and you'll come straight back here, signed in.
        </Notice>
        <p className="auth-foot">
          Wrong address?{" "}
          <button type="button" className="text-link" onClick={() => setCheckInbox(false)}>
            Change it
          </button>
        </p>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      plate={plate}
      caption="This is the name people will see on your requests. It takes about two minutes to set up your profile."
      door={doorState}
    >
      <h1 className="h-page">Create your account</h1>
      <GoogleBlock label="Sign up with Google" divider="or sign up with email" door={door} />
      <form className="auth-form" onSubmit={submit} noValidate>
        <label className="field">
          <span className="field-label">Name</span>
          <input className="input" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="field">
          <span className="field-label">Email</span>
          <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <span className="field-hint">Never shown to other people.</span>
        </label>
        <div className="field">
          <label className="field-label" htmlFor="signup-password">
            Password
          </label>
          <PasswordInput id="signup-password" value={password} onChange={setPassword} autoComplete="new-password" />
          <span className="field-hint">At least 8 characters.</span>
        </div>
        {error && <Notice>{error}</Notice>}
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
          {busy && <span className="spinner" aria-hidden />} Create account
        </button>
      </form>
      <p className="field-hint">
        By creating an account you agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy policy</Link>.
      </p>
      <p className="auth-foot">
        Already have an account? <Link to="/login">Sign in</Link>, or <DemoLink onClick={() => walkIn(async () => startDemo())} />.
      </p>
    </AuthFrame>
  );
}

/** Google and email links land here. The door opens once the sign-in completes. */
export function AuthCallback() {
  const { user } = useAuth();
  const door = useDoor();
  const { swingOpen } = door;
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [slow, setSlow] = useState(false);
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const failure = params.get("error_description") || hash.get("error_description");

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    swingOpen().then(() => {
      if (!cancelled) navigate("/home", { replace: true });
    });
    return () => {
      cancelled = true;
    };
  }, [user, swingOpen, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, []);

  if (failure || (slow && !user)) {
    return (
      <AuthFrame plate="Not quite" caption="Sign-in didn't finish.">
        <h1 className="h-page">Couldn't sign you in</h1>
        <Notice>{failure ? friendlyAuthError(failure.replace(/\+/g, " ")) : "The sign-in link may have expired or already been used."}</Notice>
        <p className="auth-foot">
          <Link to="/login">Back to sign in</Link>
        </p>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame plate="Welcome" caption="Opening the door for you." door={door.moment || "closed"}>
      <p className="auth-waiting">
        <span className="spinner" aria-hidden /> Signing you in
      </p>
    </AuthFrame>
  );
}

export function ResetPassword() {
  const { user, loading, updatePassword } = useAuth();
  const door = useDoor();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (loading) return <Splash />;

  if (!user) {
    return (
      <AuthFrame plate="Link expired" caption="Reset links work once and expire after an hour.">
        <h1 className="h-page">This link has expired</h1>
        <p className="muted">Ask for a new one from the sign-in page.</p>
        <p className="auth-foot">
          <Link to="/login">Back to sign in</Link>
        </p>
      </AuthFrame>
    );
  }

  const doorState = door.moment || (password.length >= 8 || busy ? "ajar" : "closed");

  return (
    <AuthFrame plate="New key" caption="Choose a new password for your account." door={doorState}>
      <h1 className="h-page">Set a new password</h1>
      <form
        className="auth-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          if (password.length < 8) {
            door.rattle();
            return setError("Use a password with at least 8 characters.");
          }
          setBusy(true);
          try {
            await updatePassword(password);
            await door.swingOpen();
            navigate("/home", { replace: true });
          } catch (err) {
            setError(friendlyAuthError(err));
            door.rattle();
            setBusy(false);
          }
        }}
      >
        <div className="field">
          <label className="field-label" htmlFor="new-password">
            New password
          </label>
          <PasswordInput id="new-password" value={password} onChange={setPassword} autoComplete="new-password" />
        </div>
        {error && <Notice>{error}</Notice>}
        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
          {busy && <span className="spinner" aria-hidden />} Save new password
        </button>
      </form>
    </AuthFrame>
  );
}
