import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog, GoogleMark } from "../components/Bits";
import { friendlyAuthError } from "../lib/authErrors";
import { getTheme, setTheme } from "../lib/theme";

function Switch({ label, hint, checked, onChange, disabled }) {
  return (
    <label className="switch-row">
      <span>
        <span className="switch-label">{label}</span>
        <span className="field-hint">{hint}</span>
      </span>
      <input type="checkbox" role="switch" className="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export default function Settings() {
  const { user, provider, signOut, updatePassword } = useAuth();
  const { me, mode, saveProfile, deleteAccount, resetDemo } = useStore();
  const toast = useToast();
  const navigate = useNavigate();
  const [theme, setThemeState] = useState(getTheme);
  const [password, setPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const demo = mode === "demo";
  const signedInWith = demo ? "Demo" : provider === "google" ? "Google" : "Email and password";

  return (
    <div className="page page-narrow">
      <header className="page-head">
        <h1 className="h-page">Settings</h1>
      </header>

      <section className="panel panel-pad settings-block" aria-labelledby="acc">
        <h2 id="acc" className="h-section">
          Account
        </h2>
        <dl className="facts">
          <div>
            <dt>Email</dt>
            <dd>{demo ? "None, you're using the demo" : user.email}</dd>
          </div>
          <div>
            <dt>Signed in with</dt>
            <dd className="with-icon">
              {provider === "google" && <GoogleMark size={16} />} {signedInWith}
            </dd>
          </div>
        </dl>
        {provider === "email" && (
          <form
            className="inline-form"
            onSubmit={async (e) => {
              e.preventDefault();
              if (password.length < 8) return toast.error("Use a password with at least 8 characters.");
              setPwBusy(true);
              try {
                await updatePassword(password);
                setPassword("");
                toast("Password changed");
              } catch (err) {
                toast.error(friendlyAuthError(err));
              } finally {
                setPwBusy(false);
              }
            }}
          >
            <label className="field">
              <span className="field-label">New password</span>
              <input className="input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <button type="submit" className="btn btn-ghost" disabled={pwBusy || !password}>
              Change password
            </button>
          </form>
        )}
        <button
          type="button"
          className="btn btn-ghost"
          onClick={async () => {
            await signOut();
            navigate("/", { replace: true });
          }}
        >
          {demo ? "Leave the demo" : "Sign out"}
        </button>
      </section>

      <section className="panel panel-pad settings-block" aria-labelledby="priv">
        <h2 id="priv" className="h-section">
          Privacy
        </h2>
        <Switch
          label="Show me in Discover"
          hint="When off, only people you're already connected with can see your profile."
          checked={me.visible}
          onChange={(v) => saveProfile({ visible: v }, v ? "You're visible in Discover" : "You're hidden from Discover")}
        />
        <Switch
          label="Show when I'm online"
          hint="Others see a green dot while you have the app open."
          checked={me.show_online}
          onChange={(v) => saveProfile({ show_online: v }, "Saved")}
        />
      </section>

      <section className="panel panel-pad settings-block" aria-labelledby="look">
        <h2 id="look" className="h-section">
          Appearance
        </h2>
        <fieldset className="seg">
          <legend className="field-label">Theme</legend>
          {[
            ["system", "Match my device"],
            ["light", "Light"],
            ["dark", "Dark"],
          ].map(([value, label]) => (
            <label key={value} className="seg-option">
              <input
                type="radio"
                name="theme"
                value={value}
                checked={theme === value}
                onChange={() => {
                  setTheme(value);
                  setThemeState(value);
                }}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      </section>

      {demo ? (
        <section className="panel panel-pad settings-block" aria-labelledby="demo">
          <h2 id="demo" className="h-section">
            Demo
          </h2>
          <p className="muted">Put the sample profiles, requests and messages back the way they started.</p>
          <button type="button" className="btn btn-ghost" onClick={resetDemo}>
            Reset the demo
          </button>
        </section>
      ) : (
        <section className="panel panel-pad settings-block danger-block" aria-labelledby="del">
          <h2 id="del" className="h-section">
            Delete account
          </h2>
          <p className="muted">This removes your profile, connections, saved list and messages for good. It can't be undone.</p>
          <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
            Delete my account
          </button>
        </section>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your account?"
        confirmLabel="Delete account"
        tone="danger"
        busy={deleting}
        confirmDisabled={deleteText.trim().toLowerCase() !== "delete"}
        onClose={() => {
          setConfirmDelete(false);
          setDeleteText("");
        }}
        onConfirm={async () => {
          setDeleting(true);
          try {
            await deleteAccount();
            navigate("/", { replace: true });
          } catch {
            setDeleting(false);
          }
        }}
      >
        <p className="muted">Everyone you've talked to will lose your conversations too.</p>
        <label className="field">
          <span className="field-label">Type delete to confirm</span>
          <input className="input" value={deleteText} onChange={(e) => setDeleteText(e.target.value)} autoComplete="off" />
        </label>
      </ConfirmDialog>
    </div>
  );
}
