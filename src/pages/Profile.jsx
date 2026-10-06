import { useMemo, useState } from "react";
import { Link, useBlocker } from "react-router-dom";
import { Eye } from "lucide-react";
import { useStore } from "../context/StoreContext";
import { AboutFields, BasicsFields, DailyLifeFields, PhotoField, SearchFields } from "../components/ProfileFields";
import { ConfirmDialog } from "../components/Bits";
import { validateProfile } from "../lib/validate";
import { profileGaps } from "../lib/match";
import { PROFILE_FIELDS } from "../lib/options";

const SECTIONS = [
  { id: "basics", title: "About you", Fields: BasicsFields },
  { id: "search", title: "What you're looking for", Fields: SearchFields },
  { id: "daily", title: "Day to day", Fields: DailyLifeFields },
  { id: "about", title: "Interests and bio", Fields: AboutFields },
];

const same = (a, b) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

export default function Profile() {
  const { me, saveProfile, uploadAvatar } = useStore();
  const [draft, setDraft] = useState(me);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const dirty = useMemo(() => PROFILE_FIELDS.some((k) => k !== "avatar_url" && !same(draft[k], me[k])), [draft, me]);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && currentLocation.pathname !== nextLocation.pathname);
  const gaps = profileGaps(draft);

  const set = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(patch)) delete next[k];
      if ("rent_min" in patch || "rent_max" in patch) delete next.rent;
      return next;
    });
  };

  async function save(e) {
    e?.preventDefault();
    const problems = validateProfile(draft);
    setErrors(problems);
    if (Object.keys(problems).length) {
      document.querySelector("[aria-invalid='true']")?.focus();
      return false;
    }
    setBusy(true);
    try {
      const row = await saveProfile(draft, "Profile saved");
      setDraft(row);
      return true;
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page page-narrow">
      <header className="page-head page-head-row">
        <div>
          <h1 className="h-page">Your profile</h1>
          <p className="lede">{gaps.percent}% complete. Everything here is visible to people in Discover, except your email.</p>
        </div>
        <Link to={`/people/${me.id}`} className="btn btn-ghost btn-sm">
          <Eye size={16} aria-hidden /> Preview
        </Link>
      </header>

      <form onSubmit={save} noValidate className="profile-form">
        <section className="panel panel-pad">
          <PhotoField
            draft={draft}
            onUpload={async (file) => {
              const row = await uploadAvatar(file);
              setDraft((d) => ({ ...d, avatar_url: row.avatar_url }));
            }}
          />
        </section>
        {SECTIONS.map(({ id, title, Fields }) => (
          <section key={id} className="panel panel-pad" aria-labelledby={`sec-${id}`}>
            <h2 id={`sec-${id}`} className="h-section section-title">
              {title}
            </h2>
            <Fields draft={draft} set={set} errors={errors} />
          </section>
        ))}

        <div className={`savebar ${dirty ? "is-dirty" : ""}`}>
          <span>{dirty ? "You have unsaved changes" : "All changes saved"}</span>
          <div className="action-row">
            {dirty && (
              <button type="button" className="btn btn-quiet" onClick={() => { setDraft(me); setErrors({}); }}>
                Discard
              </button>
            )}
            <button type="submit" className="btn btn-primary" disabled={!dirty || busy}>
              {busy && <span className="spinner" aria-hidden />} Save changes
            </button>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={blocker.state === "blocked"}
        title="Leave without saving?"
        confirmLabel="Save and leave"
        onClose={() => blocker.reset?.()}
        onConfirm={async () => {
          const ok = await save();
          if (ok) blocker.proceed?.();
          else blocker.reset?.();
        }}
      >
        <p className="muted">You've changed your profile but haven't saved it.</p>
        <button type="button" className="btn btn-quiet btn-sm discard-leave" onClick={() => blocker.proceed?.()}>
          Leave and discard changes
        </button>
      </ConfirmDialog>
    </div>
  );
}
