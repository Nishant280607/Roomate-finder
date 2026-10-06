import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { Brand } from "../components/Bits";
import { AboutFields, BasicsFields, DailyLifeFields, PhotoField, SearchFields } from "../components/ProfileFields";
import { defaultMoveIn, validateProfile } from "../lib/validate";
import { EMPTY_PROFILE } from "../lib/options";
import { firstName } from "../lib/format";

const STEPS = [
  { key: "basics", title: "About you", blurb: "The basics people see first." },
  { key: "search", title: "What you're looking for", blurb: "Where, when and how much. This drives most of the match." },
  { key: "daily", title: "Day to day", blurb: "Be honest. Mismatched sleep and mess cause most flatmate trouble." },
  { key: "about", title: "A bit more", blurb: "Optional, but shared interests make a first message easier." },
];

export default function Onboarding() {
  const { me, saveProfile, uploadAvatar } = useStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [draft, setDraft] = useState(() => ({
    ...EMPTY_PROFILE,
    ...Object.fromEntries(Object.entries(me || {}).filter(([, v]) => v !== null && v !== undefined)),
    move_in: me?.move_in || defaultMoveIn(),
  }));

  const set = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => {
      const next = { ...e };
      for (const k of Object.keys(patch)) delete next[k];
      if ("rent_min" in patch || "rent_max" in patch) delete next.rent;
      return next;
    });
  };

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  async function next(e) {
    e.preventDefault();
    const problems = validateProfile(draft, [current.key]);
    setErrors(problems);
    if (Object.keys(problems).length) return;
    setBusy(true);
    try {
      await saveProfile({ ...draft, onboarded: last });
      if (last) navigate("/home", { replace: true });
      else {
        setStep((s) => s + 1);
        window.scrollTo({ top: 0 });
      }
    } catch {
      // Toast shown by the store.
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="onboard">
      <header className="onboard-top">
        <Brand to="/welcome" />
        <button type="button" className="btn btn-quiet btn-sm" onClick={signOut}>
          Sign out
        </button>
      </header>

      <main className="onboard-main">
        <ol className="onboard-steps" aria-label="Profile setup">
          {STEPS.map((s, i) => (
            <li key={s.key} className={i === step ? "is-current" : i < step ? "is-done" : ""} aria-current={i === step ? "step" : undefined}>
              <span className="num">{i + 1}</span> {s.title}
            </li>
          ))}
        </ol>

        <form className="panel panel-pad onboard-card" onSubmit={next} noValidate>
          <div className="onboard-head">
            {step === 0 && <p className="muted">Welcome, {firstName(draft.full_name)}. Let's set up your profile.</p>}
            <h1 className="h-page">{current.title}</h1>
            <p className="muted">{current.blurb}</p>
          </div>

          {current.key === "basics" && (
            <>
              <PhotoField
                draft={draft}
                onUpload={async (file) => {
                  const row = await uploadAvatar(file);
                  set({ avatar_url: row.avatar_url });
                }}
              />
              <BasicsFields draft={draft} set={set} errors={errors} />
            </>
          )}
          {current.key === "search" && <SearchFields draft={draft} set={set} errors={errors} />}
          {current.key === "daily" && <DailyLifeFields draft={draft} set={set} />}
          {current.key === "about" && <AboutFields draft={draft} set={set} />}

          <div className="onboard-actions">
            {step > 0 && (
              <button type="button" className="btn btn-quiet" onClick={() => setStep((s) => s - 1)}>
                Back
              </button>
            )}
            <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
              {busy && <span className="spinner" aria-hidden />}
              {last ? "See my matches" : "Continue"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
