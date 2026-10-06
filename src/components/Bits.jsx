import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { initials } from "../lib/format";
import { matchWord } from "../lib/match";

const TINTS = ["#1e4636", "#7a4b2a", "#2d4a7a", "#7a2d4f", "#4a5d23", "#5b3a7a", "#21616b", "#8a5a12", "#6b2f2f"];

function tintFor(id = "") {
  let h = 0;
  for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TINTS[h % TINTS.length];
}

export function Avatar({ person, size = 40, online = false }) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.36) };
  return (
    <span className="avatar" style={style}>
      {person?.avatar_url ? (
        <img src={person.avatar_url} alt="" referrerPolicy="no-referrer" loading="lazy" />
      ) : (
        <span className="avatar-fill" style={{ background: tintFor(person?.id) }} aria-hidden>
          {initials(person?.full_name)}
        </span>
      )}
      {online && <span className="avatar-dot" title="Online now" />}
    </span>
  );
}

/** The door mark: a green door with a brass knob. */
export function BrandMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden focusable="false">
      <rect x="4" y="2" width="24" height="29" rx="3" fill="var(--brass)" />
      <path d="M8 31V9a8 8 0 0 1 16 0v22z" fill="var(--door)" />
      <path d="M8 31V9a8 8 0 0 1 16 0v22" fill="none" stroke="var(--brass-ink)" strokeOpacity=".25" />
      <circle cx="20" cy="19" r="1.8" fill="var(--brass)" />
    </svg>
  );
}

export function Brand({ to = "/", tone = "ink" }) {
  return (
    <Link to={to} className={`brand brand-${tone}`} aria-label="RoomieFinder home">
      <BrandMark />
      <span>RoomieFinder</span>
    </Link>
  );
}

export function GoogleMark({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden focusable="false">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/** The brass plate that carries a compatibility score. */
export function MatchPlate({ score, size = "md", showWord = false }) {
  return (
    <div className={`plate plate-${size}`} aria-label={`${score} percent match, ${matchWord(score)}`}>
      <span className="plate-num num">{score}</span>
      <span className="plate-unit">% match</span>
      {showWord && <span className="plate-word">{matchWord(score)}</span>}
    </div>
  );
}

export function Spinner({ label = "Loading" }) {
  return <span className="spinner" role="status" aria-label={label} />;
}

export function Splash({ text = "Opening the door" }) {
  return (
    <div className="splash">
      <BrandMark size={44} />
      <p className="muted">{text}</p>
    </div>
  );
}

export function ConfirmDialog({ open, title, children, confirmLabel, tone = "primary", busy, onConfirm, onClose, confirmDisabled }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} onCancel={onClose} aria-labelledby="dialog-title">
      <form
        method="dialog"
        className="dialog-body"
        onSubmit={(e) => {
          e.preventDefault();
          onConfirm();
        }}
      >
        <h2 id="dialog-title" className="h-section">
          {title}
        </h2>
        {children}
        <div className="dialog-actions">
          <button type="button" className="btn btn-quiet" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={`btn ${tone === "danger" ? "btn-danger" : "btn-primary"}`} disabled={busy || confirmDisabled}>
            {busy ? <span className="spinner" aria-hidden /> : null}
            {confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
