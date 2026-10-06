import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, MessageSquareText } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { Avatar, ConfirmDialog, MatchPlate } from "../components/Bits";
import { ConnectActions, SaveButton, TraitCompare } from "../components/People";
import { computeMatch, matchWord } from "../lib/match";
import { HABITS, habitLabel, housingShort, optionLabel, GENDER_PREFS } from "../lib/options";
import { ageLine, firstName, formatMoveIn, placeLine, rentRange } from "../lib/format";

export default function Person() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { me, memberById, relationTo, online, removeConnection } = useStore();
  const [confirmRemove, setConfirmRemove] = useState(false);

  const isMe = id === me.id || id === "me";
  const person = isMe ? me : memberById.get(id);

  if (!person) {
    return (
      <div className="page">
        <div className="empty">
          <h3>This profile isn't available</h3>
          <p>They may have hidden their profile or deleted their account.</p>
          <Link to="/discover" className="btn btn-ghost btn-sm">
            Back to Discover
          </Link>
        </div>
      </div>
    );
  }

  const match = isMe ? null : computeMatch(me, person);
  const rel = isMe ? null : relationTo(person.id);
  const name = firstName(person.full_name);
  const shared = new Set((match?.sharedInterests || []).map((s) => s.toLowerCase()));
  const sharedLang = new Set((match?.sharedLanguages || []).map((s) => s.toLowerCase()));

  return (
    <div className="page page-narrow">
      <button type="button" className="btn btn-quiet btn-sm back" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/discover"))}>
        <ArrowLeft size={16} aria-hidden /> Back
      </button>

      {isMe && (
        <div className="notice notice-info">
          <span>
            This is how other people see your profile. <Link to="/profile">Edit profile</Link>
          </span>
        </div>
      )}

      <header className="profile-head">
        <Avatar person={person} size={96} online={!isMe && online.has(person.id) && person.show_online !== false} />
        <div className="profile-id">
          <h1 className="h-page">{person.full_name}</h1>
          <p className="profile-sub">{ageLine(person)}</p>
          <p className="profile-sub muted">{placeLine(person)}</p>
          <div className="person-facts">
            {person.housing && <span className="tag tag-room">{housingShort(person.housing)}</span>}
            <span className="tag num">{rentRange(person.rent_min, person.rent_max)} a month</span>
            <span className="tag">Moving {formatMoveIn(person.move_in)}</span>
          </div>
        </div>
        {!isMe && (
          <div className="profile-actions">
            <ConnectActions person={person} />
            <SaveButton personId={person.id} withLabel />
          </div>
        )}
      </header>

      {rel?.state === "incoming" && rel.conn.note && (
        <blockquote className="request-note">
          <MessageSquareText size={18} aria-hidden />
          <p>
            <strong>{name} wrote:</strong> {rel.conn.note}
          </p>
        </blockquote>
      )}

      {match && (
        <section className="panel panel-pad fit">
          <div className="fit-score">
            <MatchPlate score={match.score} size="lg" />
            <div>
              <h2 className="h-section">{matchWord(match.score)}</h2>
              <p className="muted">Based on what you've both shared.</p>
            </div>
          </div>
          <div className="fit-lists">
            <div>
              <h3 className="fit-title">Why you'd get along</h3>
              {match.good.length ? (
                <ul className="fit-list">
                  {match.good.slice(0, 6).map((r) => (
                    <li key={r}>
                      <Check size={16} aria-hidden /> {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Nothing stands out yet. Filling in more of your profile helps.</p>
              )}
            </div>
            <div>
              <h3 className="fit-title">Worth talking about</h3>
              {match.heads.length ? (
                <ul className="fit-list fit-list-heads">
                  {match.heads.slice(0, 5).map((r) => (
                    <li key={r}>
                      <MessageSquareText size={16} aria-hidden /> {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">No obvious friction points. Still worth a call before you sign anything.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {person.bio && (
        <section className="section">
          <h2 className="h-section">About {isMe ? "you" : name}</h2>
          <p className="bio">{person.bio}</p>
        </section>
      )}

      <section className="section">
        <h2 className="h-section">Day to day</h2>
        {isMe ? (
          <TraitCompare me={null} them={{ ...person, full_name: "You" }} />
        ) : (
          <TraitCompare me={me} them={person} />
        )}
      </section>

      <section className="section">
        <h2 className="h-section">Habits</h2>
        <dl className="facts">
          {Object.keys(HABITS).map((key) => (
            <div key={key}>
              <dt>{HABITS[key].label}</dt>
              <dd>{habitLabel(key, person[key])}</dd>
            </div>
          ))}
          <div>
            <dt>Happy to live with</dt>
            <dd>{optionLabel(GENDER_PREFS, person.pref_gender) || "Anyone"}</dd>
          </div>
        </dl>
      </section>

      {(person.interests?.length > 0 || person.languages?.length > 0) && (
        <section className="section">
          <h2 className="h-section">Interests and languages</h2>
          <div className="chips">
            {(person.interests || []).map((i) => (
              <span key={i} className={`chip ${shared.has(i.toLowerCase()) ? "is-shared" : ""}`}>
                {shared.has(i.toLowerCase()) && <Check size={13} aria-hidden />}
                {i}
              </span>
            ))}
          </div>
          {person.languages?.length > 0 && (
            <p className="langs">
              Speaks{" "}
              {person.languages.map((l, i) => (
                <span key={l}>
                  {i > 0 && (i === person.languages.length - 1 ? " and " : ", ")}
                  <span className={sharedLang.has(l.toLowerCase()) ? "lang-shared" : ""}>{l}</span>
                </span>
              ))}
            </p>
          )}
          {!isMe && shared.size > 0 && <p className="footnote">Highlighted interests are ones you share.</p>}
        </section>
      )}

      {rel?.state === "connected" && (
        <section className="section danger-zone">
          <button type="button" className="text-link danger" onClick={() => setConfirmRemove(true)}>
            Remove {name} from your connections
          </button>
          <ConfirmDialog
            open={confirmRemove}
            title={`Remove ${name}?`}
            confirmLabel="Remove connection"
            tone="danger"
            onClose={() => setConfirmRemove(false)}
            onConfirm={async () => {
              try {
                await removeConnection(rel.conn);
                setConfirmRemove(false);
              } catch {
                // Toast shown by the store.
              }
            }}
          >
            <p className="muted">You won't be able to message each other until one of you sends a new request. Your past messages stay.</p>
          </ConfirmDialog>
        </section>
      )}
    </div>
  );
}
