import { useId, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { Avatar } from "./Bits";
import { CITIES, GENDER_PREFS, GENDERS, HABITS, HOUSING, INTERESTS, LANGUAGES, RENT_PRESETS, TRAITS } from "../lib/options";
import { daysFromNow, shortRupees } from "../lib/format";

/* Each section takes the whole draft profile and a `set(patch)` function,
   so onboarding and the profile page can share them. */

function Seg({ legend, name, options, value, onChange, hint }) {
  return (
    <fieldset className="seg">
      <legend className="field-label">{legend}</legend>
      {options.map((o) => (
        <label className="seg-option" key={o.value}>
          <input type="radio" name={name} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
          <span>{o.label}</span>
        </label>
      ))}
      {hint && <p className="field-hint seg-hint">{hint}</p>}
    </fieldset>
  );
}

export function PhotoField({ draft, onUpload }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="photo-field">
      <Avatar person={draft} size={72} />
      <div>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => input.current?.click()}>
          <Camera size={16} aria-hidden /> {draft.avatar_url ? "Change photo" : "Add a photo"}
        </button>
        <p className="field-hint">People are far more likely to accept a request from someone with a photo.</p>
        <input
          ref={input}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true);
            try {
              await onUpload(file);
            } catch {
              // Error toast shown by the store.
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
    </div>
  );
}

export function BasicsFields({ draft, set, errors = {} }) {
  const id = useId();
  return (
    <div className="form-grid">
      <label className="field">
        <span className="field-label">Name</span>
        <input
          className="input"
          value={draft.full_name}
          maxLength={80}
          autoComplete="name"
          aria-invalid={Boolean(errors.full_name)}
          onChange={(e) => set({ full_name: e.target.value })}
        />
        {errors.full_name && <span className="field-error">{errors.full_name}</span>}
      </label>
      <div className="field-row">
        <label className="field">
          <span className="field-label">Age</span>
          <input
            className="input num"
            type="number"
            inputMode="numeric"
            min={16}
            max={99}
            value={draft.age ?? ""}
            aria-invalid={Boolean(errors.age)}
            onChange={(e) => set({ age: e.target.value === "" ? null : Number(e.target.value) })}
          />
          {errors.age && <span className="field-error">{errors.age}</span>}
        </label>
        <label className="field">
          <span className="field-label">What you do</span>
          <input
            className="input"
            value={draft.occupation}
            maxLength={80}
            placeholder="Student, designer, nurse…"
            onChange={(e) => set({ occupation: e.target.value })}
          />
        </label>
      </div>
      <Seg
        legend="Gender"
        name={`${id}-gender`}
        options={GENDERS}
        value={draft.gender}
        onChange={(v) => set({ gender: v })}
        hint="Used only so people who want a same-gender flatmate can find each other."
      />
      <Seg
        legend="I'm happy to live with"
        name={`${id}-pref`}
        options={GENDER_PREFS}
        value={draft.pref_gender}
        onChange={(v) => set({ pref_gender: v })}
      />
    </div>
  );
}

export function SearchFields({ draft, set, errors = {} }) {
  const id = useId();
  const areas = CITIES[draft.city] || [];
  return (
    <div className="form-grid">
      <Seg
        legend="Your situation"
        name={`${id}-housing`}
        options={HOUSING}
        value={draft.housing}
        onChange={(v) => set({ housing: v })}
        hint={HOUSING.find((h) => h.value === draft.housing)?.hint}
      />
      {errors.housing && <span className="field-error">{errors.housing}</span>}

      <div className="field-row">
        <label className="field">
          <span className="field-label">City</span>
          <input
            className="input"
            list={`${id}-cities`}
            value={draft.city}
            maxLength={60}
            aria-invalid={Boolean(errors.city)}
            onChange={(e) => set({ city: e.target.value })}
          />
          <datalist id={`${id}-cities`}>
            {Object.keys(CITIES).map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
          {errors.city && <span className="field-error">{errors.city}</span>}
        </label>
        <label className="field">
          <span className="field-label">Area or neighbourhood</span>
          <input
            className="input"
            list={`${id}-areas`}
            value={draft.area}
            maxLength={60}
            placeholder={areas[0] ? `e.g. ${areas[0]}` : ""}
            onChange={(e) => set({ area: e.target.value })}
          />
          <datalist id={`${id}-areas`}>
            {areas.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </label>
      </div>

      <div className="field">
        <span className="field-label" id={`${id}-rent`}>
          Monthly rent for your share
        </span>
        <div className="field-row" role="group" aria-labelledby={`${id}-rent`}>
          <label className="input-affix">
            <span aria-hidden>₹</span>
            <input
              className="input num"
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              aria-label="Minimum rent"
              placeholder="From"
              value={draft.rent_min ?? ""}
              aria-invalid={Boolean(errors.rent)}
              onChange={(e) => set({ rent_min: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </label>
          <label className="input-affix">
            <span aria-hidden>₹</span>
            <input
              className="input num"
              type="number"
              inputMode="numeric"
              min={0}
              step={500}
              aria-label="Maximum rent"
              placeholder="To"
              value={draft.rent_max ?? ""}
              aria-invalid={Boolean(errors.rent)}
              onChange={(e) => set({ rent_max: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </label>
        </div>
        <div className="chips">
          {RENT_PRESETS.map(([lo, hi]) => (
            <button
              key={lo}
              type="button"
              className="chip num"
              aria-pressed={draft.rent_min === lo && draft.rent_max === hi}
              onClick={() => set({ rent_min: lo, rent_max: hi })}
            >
              ₹{shortRupees(lo)}–{shortRupees(hi)}
            </button>
          ))}
        </div>
        {errors.rent && <span className="field-error">{errors.rent}</span>}
      </div>

      <label className="field">
        <span className="field-label">Move-in date</span>
        <input
          className="input num"
          type="date"
          min={daysFromNow(-30)}
          value={draft.move_in ?? ""}
          aria-invalid={Boolean(errors.move_in)}
          onChange={(e) => set({ move_in: e.target.value || null })}
        />
        {errors.move_in && <span className="field-error">{errors.move_in}</span>}
      </label>
    </div>
  );
}

export function DailyLifeFields({ draft, set }) {
  const id = useId();
  return (
    <div className="form-grid">
      {TRAITS.map((t) => (
        <label className="field slider" key={t.key}>
          <span className="slider-top">
            <span className="field-label">{t.label}</span>
            <span className="slider-value">{t.steps[(draft[t.key] ?? 3) - 1]}</span>
          </span>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={draft[t.key] ?? 3}
            aria-valuetext={t.steps[(draft[t.key] ?? 3) - 1]}
            onChange={(e) => set({ [t.key]: Number(e.target.value) })}
          />
          <span className="slider-ends" aria-hidden>
            <span>{t.steps[0]}</span>
            <span>{t.steps[4]}</span>
          </span>
        </label>
      ))}
      <div className="habits">
        {Object.entries(HABITS).map(([key, h]) => (
          <Seg key={key} legend={h.label} name={`${id}-${key}`} options={h.options} value={draft[key]} onChange={(v) => set({ [key]: v })} />
        ))}
      </div>
    </div>
  );
}

function ToggleChips({ label, all, value, onChange, max }) {
  const picked = new Set(value || []);
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="chips">
        {all.map((item) => {
          const on = picked.has(item);
          return (
            <button
              key={item}
              type="button"
              className="chip"
              aria-pressed={on}
              disabled={!on && max && picked.size >= max}
              onClick={() => onChange(on ? value.filter((v) => v !== item) : [...(value || []), item])}
            >
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AboutFields({ draft, set }) {
  return (
    <div className="form-grid">
      <ToggleChips label="Interests (pick up to 8)" all={INTERESTS} value={draft.interests} max={8} onChange={(v) => set({ interests: v })} />
      <ToggleChips label="Languages you speak" all={LANGUAGES} value={draft.languages} onChange={(v) => set({ languages: v })} />
      <label className="field">
        <span className="field-label">About you</span>
        <textarea
          className="textarea"
          maxLength={600}
          value={draft.bio}
          placeholder="What's a normal week like for you? What would make someone a great flatmate?"
          onChange={(e) => set({ bio: e.target.value })}
        />
        <span className="field-hint num">{(draft.bio || "").length}/600</span>
      </label>
    </div>
  );
}
