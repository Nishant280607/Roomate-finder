import { useState } from "react";
import { Check, ClipboardList, Pencil } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { ConfirmDialog } from "./Bits";
import { DailyLifeFields, SearchFields } from "./ProfileFields";
import { HABITS, habitLabel, housingShort, pickPrefs, PREF_KEYS, TRAITS } from "../lib/options";
import { firstName, formatMoveIn, rentRange } from "../lib/format";
import { validateProfile } from "../lib/validate";

/** A snapshot of someone's preferences, as posted in a chat. */
export function PrefsCard({ prefs, title, compareTo }) {
  const p = prefs || {};
  const same = (key) => Boolean(compareTo) && p[key] != null && compareTo[key] === p[key];
  const basics = [
    ["Looking for", housingShort(p.housing) || "Not set"],
    ["Where", [p.area, p.city].filter(Boolean).join(", ") || "Not set"],
    ["Budget", p.rent_min == null && p.rent_max == null ? "Not set" : `${rentRange(p.rent_min, p.rent_max)} a month`],
    ["Moving", formatMoveIn(p.move_in)],
  ];
  const habits = [
    ...TRAITS.map((t) => [t.key, t.label, t.steps[(p[t.key] ?? 3) - 1]]),
    ...Object.keys(HABITS).map((k) => [k, HABITS[k].label, habitLabel(k, p[k])]),
  ];

  return (
    <div className="prefs-card">
      <p className="prefs-title">
        <ClipboardList size={16} aria-hidden /> {title}
      </p>
      <dl className="prefs-list">
        {basics.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <dl className="prefs-list prefs-habits">
        {habits.map(([key, label, value]) => (
          <div key={key}>
            <dt>{label}</dt>
            <dd>
              {value}
              {same(key) && (
                <span className="prefs-same">
                  <Check size={12} aria-hidden /> Same as you
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Lets you check, edit and then post your preferences into a conversation. */
export function SharePrefsDialog({ person, onClose }) {
  const { me, sharePreferences } = useStore();
  const [draft, setDraft] = useState(() => pickPrefs(me));
  const [editing, setEditing] = useState(false);
  const [alsoSave, setAlsoSave] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const changed = PREF_KEYS.some((k) => (draft[k] ?? null) !== (me[k] ?? null));

  const set = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors({});
  };

  async function post() {
    const problems = validateProfile(draft, ["search"]);
    if (Object.keys(problems).length) {
      setErrors(problems);
      setEditing(true);
      return;
    }
    setBusy(true);
    try {
      await sharePreferences(person.id, draft, changed && alsoSave);
      onClose();
    } catch {
      setBusy(false);
    }
  }

  return (
    <ConfirmDialog
      open
      wide
      title={`Share your preferences with ${firstName(person.full_name)}`}
      confirmLabel="Post in chat"
      busy={busy}
      onClose={onClose}
      onConfirm={post}
    >
      <p className="muted">{firstName(person.full_name)} will see this card in your conversation.</p>
      <PrefsCard prefs={draft} title="Your preferences" />
      {editing ? (
        <div className="share-edit">
          <SearchFields draft={draft} set={set} errors={errors} />
          <DailyLifeFields draft={draft} set={set} />
          {changed && (
            <label className="check">
              <input type="checkbox" checked={alsoSave} onChange={(e) => setAlsoSave(e.target.checked)} />
              Also save these changes to my profile
            </label>
          )}
        </div>
      ) : (
        <button type="button" className="btn btn-ghost btn-sm share-edit-toggle" onClick={() => setEditing(true)}>
          <Pencil size={14} aria-hidden /> Edit before posting
        </button>
      )}
    </ConfirmDialog>
  );
}
