import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CircleAlert, MailCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Brand, GoogleMark, Splash } from "../components/Bits";
import { friendlyAuthError } from "../lib/authErrors";

/* The left half of every sign-in screen: a front door whose brass
   nameplate shows who's arriving. */
function Door({ plate, caption }) {
  return (
    <div className="door-side">
      <Brand tone="light" />
      <div className="door" aria-hidden>
        <div className="door-panels">
          <span />
          <span />
        </div>
        <div className="door-plate">
          <span className="door-plate-text" style={{ fontSize: `${plate.length > 18 ? 0.82 : plate.length > 12 ? 0.95 : 1.15}em` }}>
            {plate}
          </span>
        </div>
        <span className="door-knob" />
        <span className="door-peephole" />
      </div>
      <p className="door-caption">{caption}</p>
    </div>
  );
}

function AuthFrame({ plate, caption, children }) {
  return (
    <div className="auth">
      <Door plate={plate} caption={caption} />
      <main className="auth-side">
        <div className="auth-box">{children}</div>
      </main>
    </div>
  );
}

function GoogleButton({ label }) {
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
          try {
            await signInWithGoogle();
          } catch (e) {
            setError(friendlyAuthError(e));
            setBusy(false);
          }
        }}
      >
        {busy ? <span className="spinner" aria-hidden /> : <GoogleMark />}
        {label}
      </button>
      {error && <Notice tone="error">{error}</Notice>}
    </>
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

function PasswordInput({ id, value, onChange, autoComplete, invalid }) {
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
        aria-invalid={invalid}
        required
      />
      <button type="button" onClick={() => setShown((s) => !s)} aria-pressed={shown}>
        {shown ? "Hide" : "Show"}
      </button>
    </div>
  );
}

function DemoLink() {
  const { startDemo } = useAuth();
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className="text-link"
      onClick={() => {
        startDemo();
        navigate("/home");
      }}
    >
      explore the demo
    </button>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Login() {
  const { signInWithEmail, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address.");
    setBusy(true);
    try {
      if (mode === "reset") {
        await sendPasswordReset(email.trim());
        setSent(true);
      } else {
        await signInWithEmail(email.trim(), password);
        // PublicOnly sends you on once the session arrives.
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  if (mode === "reset") {
    return (
      <AuthFrame plate="Locked out?" caption="It happens. We'll send you a link to set a new password.">
        <h1 className="h-page">Reset your password</h1>
        {sent ? (
          <Notice tone="ok">
            If there's an account for <strong>{email.trim()}</strong>, a reset link is on its way. It works once and expires in an hour.
          </Notice>
        ) : (
          <form className="auth-form" onSubmit={submit} noValidate>
            <label className="field">
              <span className="field-label">Email</span>
              <input className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            {error && <Notice>{error}</Notice>}
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
              {busy && <span className="spinner" aria-hidden />} Send reset link
            </button>
          </form>
        )}
        <p className="auth-foot">
          <button type="button" className="text-link" onClick={() => { setMode("signin"); setSent(false); setError(""); }}>
            Back to sign in
          </button>
        </p>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame plate="Welcome back" caption="Sign in to see who's replied and who's new in your city.">
      <h1 className="h-page">Sign in</h1>
      <GoogleButton label="Continue with Google" />
      <div className="divider-or">or use your email</div>
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
            <button type="button" className="text-link small" onClick={() => { setMode("reset"); setError(""); }}>
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
        New here? <Link to="/signup">Create an account</Link>, or <DemoLink />.
      </p>
    </AuthFrame>
  );
}

export function Signup() {
  const { signUpWithEmail } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [checkInbox, setCheckInbox] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Add your name.");
    if (!EMAIL_RE.test(email.trim())) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Use a password with at least 8 characters.");
    setBusy(true);
    try {
      const { needsConfirmation } = await signUpWithEmail({ name: name.trim(), email: email.trim(), password });
      if (needsConfirmation) setCheckInbox(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  const plate = name.trim() || "Your name";

  if (checkInbox) {
    return (
      <AuthFrame plate={plate} caption="Almost there.">
        <h1 className="h-page">Check your inbox</h1>
        <Notice tone="ok">
          We sent a confirmation link to <strong>{email.trim()}</strong>. Open it on this device and you'll come straight back here,
          signed in.
        </Notice>
        <p className="auth-foot">
          Wrong address? <button type="button" className="text-link" onClick={() => setCheckInbox(false)}>Change it</button>
        </p>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame plate={plate} caption="This is the name people will see on your requests. It takes about two minutes to set up your profile.">
      <h1 className="h-page">Create your account</h1>
      <GoogleButton label="Sign up with Google" />
      <div className="divider-or">or sign up with email</div>
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
      <p className="auth-foot">
        Already have an account? <Link to="/login">Sign in</Link>, or <DemoLink />.
      </p>
    </AuthFrame>
  );
}

/** Google and email links land here. Supabase finishes the sign-in from the URL. */
export function AuthCallback() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [slow, setSlow] = useState(false);
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const failure = params.get("error_description") || hash.get("error_description");

  useEffect(() => {
    if (user) navigate("/home", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, []);

  if (failure || (slow && !loading && !user)) {
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
  return <Splash text="Signing you in" />;
}

export function ResetPassword() {
  const { user, loading, updatePassword } = useAuth();
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

  return (
    <AuthFrame plate="New key" caption="Choose a new password for your account.">
      <h1 className="h-page">Set a new password</h1>
      <form
        className="auth-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          if (password.length < 8) return setError("Use a password with at least 8 characters.");
          setBusy(true);
          try {
            await updatePassword(password);
            navigate("/home", { replace: true });
          } catch (err) {
            setError(friendlyAuthError(err));
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
