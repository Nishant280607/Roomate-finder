import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Check, Clock, MessageCircle, UserPlus, X } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { Avatar, ConfirmDialog, MatchPlate } from "./Bits";
import { ageLine, firstName, formatMoveIn, placeLine, rentRange } from "../lib/format";
import { housingShort, TRAITS } from "../lib/options";

/** Connect / Request sent / Accept / Message, depending on where things stand. */
export function ConnectActions({ person, size = "md", showMessage = true }) {
  const { relationTo, connect, respond, removeConnection } = useStore();
  const [dialog, setDialog] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const rel = relationTo(person.id);
  const sm = size === "sm" ? "btn-sm" : "";
  const name = firstName(person.full_name);

  async function act(fn) {
    setBusy(true);
    try {
      await fn();
    } catch {
      // Toast already shown by the store.
    } finally {
      setBusy(false);
    }
  }

  if (rel.state === "connected") {
    return showMessage ? (
      <Link to={`/messages/${person.id}`} className={`btn btn-primary ${sm}`}>
        <MessageCircle size={16} aria-hidden /> Message
      </Link>
    ) : (
      <span className="tag tag-ok">
        <Check size={14} aria-hidden /> Connected
      </span>
    );
  }

  if (rel.state === "incoming") {
    return (
      <div className="action-row">
        <button type="button" className={`btn btn-primary ${sm}`} disabled={busy} onClick={() => act(() => respond(rel.conn, true))}>
          <Check size={16} aria-hidden /> Accept
        </button>
        <button type="button" className={`btn btn-ghost ${sm}`} disabled={busy} onClick={() => act(() => respond(rel.conn, false))}>
          <X size={16} aria-hidden /> Decline
        </button>
      </div>
    );
  }

  if (rel.state === "outgoing") {
    return (
      <div className="action-row">
        <span className="tag">
          <Clock size={14} aria-hidden /> Request sent
        </span>
        <button
          type="button"
          className={`btn btn-quiet ${sm}`}
          disabled={busy}
          onClick={() => act(() => removeConnection(rel.conn, "Request withdrawn"))}
        >
          Withdraw
        </button>
      </div>
    );
  }

  return (
    <>
      <button type="button" className={`btn btn-brass ${sm}`} onClick={() => setDialog(true)}>
        <UserPlus size={16} aria-hidden /> Connect
      </button>
      <ConfirmDialog
        open={dialog}
        title={`Connect with ${name}`}
        confirmLabel="Send request"
        busy={busy}
        onClose={() => setDialog(false)}
        onConfirm={() =>
          act(async () => {
            await connect(person.id, note);
            setDialog(false);
            setNote("");
          })
        }
      >
        <p className="muted">
          Once {name} accepts, you can message each other. Add a line about what you're looking for so they know why you're reaching out.
        </p>
        <label className="field">
          <span className="field-label">Note (optional)</span>
          <textarea
            className="textarea"
            maxLength={300}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={person.housing === "has_room" ? "Hi! Is your room still free? I'm looking to move in around…" : "Hi! I'm also looking in this area. Want to compare notes?"}
          />
        </label>
      </ConfirmDialog>
    </>
  );
}

export function SaveButton({ personId, withLabel = false }) {
  const { saved, toggleSave } = useStore();
  const on = saved.includes(personId);
  if (withLabel) {
    return (
      <button type="button" className="btn btn-ghost" aria-pressed={on} onClick={() => toggleSave(personId)}>
        <Bookmark size={16} aria-hidden fill={on ? "currentColor" : "none"} /> {on ? "Saved" : "Save"}
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`icon-btn ${on ? "is-on" : ""}`}
      aria-pressed={on}
      aria-label={on ? "Remove from saved" : "Save"}
      title={on ? "Saved" : "Save"}
      onClick={() => toggleSave(personId)}
    >
      <Bookmark size={17} aria-hidden fill={on ? "currentColor" : "none"} />
    </button>
  );
}

/** A person as a slip on the board: who they are, what they need, and the best reason you'd fit. */
export function PersonCard({ person, compact = false }) {
  const { online } = useStore();
  const reason = person.match?.good?.[0];
  return (
    <article className={`person ${compact ? "person-compact" : ""}`}>
      <div className="person-head">
        <Avatar person={person} size={compact ? 48 : 56} online={online.has(person.id) && person.show_online !== false} />
        <div className="person-id">
          <h3 className="person-name">
            <Link to={`/people/${person.id}`} className="stretched">
              {person.full_name || "Unnamed"}
            </Link>
          </h3>
          <p className="person-sub">{ageLine(person)}</p>
          <p className="person-place">{placeLine(person)}</p>
        </div>
        {person.match && <MatchPlate score={person.match.score} size="sm" />}
      </div>

      <div className="person-facts">
        {person.housing && <span className="tag tag-room">{housingShort(person.housing)}</span>}
        <span className="tag num">{rentRange(person.rent_min, person.rent_max)}</span>
        <span className="tag">From {formatMoveIn(person.move_in)}</span>
      </div>

      {!compact && reason && (
        <p className="person-reason">
          <Check size={15} aria-hidden /> {reason}
        </p>
      )}

      <div className="person-actions">
        <SaveButton personId={person.id} />
        <ConnectActions person={person} size="sm" />
      </div>
    </article>
  );
}

/** You and them on each day-to-day scale. */
export function TraitCompare({ me, them }) {
  const theirName = firstName(them.full_name);
  return (
    <div className="traits">
      {me && (
        <div className="traits-key" aria-hidden>
          <span className="key-you">You</span>
          <span className="key-them">{theirName}</span>
        </div>
      )}
      {TRAITS.map((t) => {
        const a = me?.[t.key];
        const b = them[t.key];
        return (
          <div className="trait" key={t.key}>
            <div className="trait-top">
              <span className="trait-label">{t.label}</span>
              <span className="trait-value">{t.steps[(b ?? 3) - 1]}</span>
            </div>
            <div
              className="trait-track"
              role="img"
              aria-label={me ? `${t.label}: you ${t.steps[(a ?? 3) - 1]}, ${theirName} ${t.steps[(b ?? 3) - 1]}` : `${t.label}: ${t.steps[(b ?? 3) - 1]}`}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`trait-stop ${a === n ? "is-you" : ""} ${b === n ? "is-them" : ""}`} />
              ))}
            </div>
            <div className="trait-ends" aria-hidden>
              <span>{t.steps[0]}</span>
              <span>{t.steps[4]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PersonRow({ person, children, meta }) {
  const { online } = useStore();
  return (
    <div className="row">
      <Avatar person={person} size={44} online={online.has(person.id) && person.show_online !== false} />
      <div className="row-main">
        <Link to={`/people/${person.id}`} className="row-name">
          {person.full_name}
        </Link>
        <p className="row-sub">{meta ?? [ageLine(person), placeLine(person)].filter(Boolean).join(", ")}</p>
      </div>
      <div className="row-actions">{children}</div>
    </div>
  );
}

