import { TRAITS } from "./options";
import { daysBetween, rentRange } from "./format";

/*
  Compatibility score, 0–100. Each factor scores 0..1 and is weighted:

    budget overlap      18     day-to-day traits   30
    same city / area    14     habits              12
    move-in timing       8     interests/language   8
    room situation      10

  Missing answers count as neutral rather than as a mismatch, so a half-filled
  profile isn't punished twice. Every factor also produces plain-language
  reasons, which is what the profile page shows.
*/

export const WEIGHTS = { budget: 18, location: 14, moveIn: 8, housing: 10, lifestyle: 30, habits: 12, extras: 8 };

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const norm = (s) => String(s || "").trim().toLowerCase();
const hasRange = (p) => Number.isFinite(p?.rent_min) && Number.isFinite(p?.rent_max);

function budgetFit(a, b) {
  if (!hasRange(a) || !hasRange(b)) return { score: 0.5 };
  const lo = Math.max(a.rent_min, b.rent_min);
  const hi = Math.min(a.rent_max, b.rent_max);
  if (hi >= lo) {
    const span = Math.min(a.rent_max - a.rent_min, b.rent_max - b.rent_min);
    const ratio = span <= 0 ? 1 : (hi - lo) / span;
    return { score: clamp01(0.65 + 0.35 * ratio), overlap: [lo, hi] };
  }
  const gap = lo - hi;
  const ref = Math.max(a.rent_max, b.rent_max) || 1;
  return { score: clamp01(0.5 - (gap / ref) * 2), gap };
}

function locationFit(a, b) {
  const ca = norm(a.city);
  const cb = norm(b.city);
  if (!ca || !cb) return { score: 0.4 };
  if (ca !== cb) return { score: 0, otherCity: true };
  const sameArea = Boolean(norm(a.area)) && norm(a.area) === norm(b.area);
  return { score: sameArea ? 1 : 0.7, sameCity: true, sameArea };
}

function moveInFit(a, b) {
  const days = daysBetween(a.move_in, b.move_in);
  if (days == null) return { score: 0.5 };
  const d = Math.abs(days);
  return { score: d <= 14 ? 1 : d <= 45 ? 0.75 : d <= 90 ? 0.4 : 0.15, days: d };
}

const HOUSING_FIT = {
  "has_room|need_room": 1,
  "has_room|team_up": 0.6,
  "has_room|has_room": 0.15,
  "need_room|need_room": 0.7,
  "need_room|team_up": 0.9,
  "team_up|team_up": 1,
};

function housingFit(a, b) {
  if (!a.housing || !b.housing) return 0.6;
  return HOUSING_FIT[[a.housing, b.housing].sort().join("|")] ?? 0.6;
}

const ORDER = {
  smoking: { never: 0, outside: 1, yes: 2 },
  drinking: { never: 0, socially: 1, often: 2 },
  diet: { vegan: 0, veg: 1, egg: 2, nonveg: 3 },
};

function ordinalFit(key, a, b, steps) {
  const map = ORDER[key];
  if (!(a in map) || !(b in map)) return 0.7;
  return steps[Math.abs(map[a] - map[b])];
}

function petsFit(a, b) {
  if (!a || !b) return 0.8;
  const pair = [a, b].sort().join("|");
  if (pair === "allergic|have") return 0;
  if (pair === "allergic|love") return 0.5;
  if (pair === "have|none") return 0.7;
  if (pair === "love|none") return 0.9;
  return 1;
}

function shared(listA = [], listB = []) {
  const b = new Set(listB.map(norm));
  return listA.filter((x) => b.has(norm(x)));
}

function joinList(items) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function computeMatch(me, them) {
  if (!me || !them) return { score: 0, good: [], heads: [] };

  const good = [];
  const heads = [];

  // Room situation
  const housing = housingFit(me, them);
  if (me.housing && them.housing) {
    const pair = `${me.housing}>${them.housing}`;
    const lines = {
      "need_room>has_room": "They have a room and you need one",
      "has_room>need_room": "You have a room and they need one",
      "team_up>team_up": "You both want to find a place together",
      "need_room>need_room": "You're both looking, so you could rent a place together",
      "need_room>team_up": "They're happy to find a place together",
      "team_up>need_room": "They need a room and you want to team up",
    };
    if (lines[pair]) good.push({ text: lines[pair], weight: 10 * housing });
    if (pair === "has_room>has_room") heads.push({ text: "You both have a room to fill", weight: 9 });
  }

  // Budget
  const budget = budgetFit(me, them);
  if (budget.overlap) {
    good.push({ text: `Budgets overlap at ${rentRange(budget.overlap[0], budget.overlap[1])}`, weight: 9 });
  } else if (budget.gap != null) {
    heads.push({ text: `Their budget is ${rentRange(them.rent_min, them.rent_max)} a month`, weight: 9 });
  }

  // Location
  const location = locationFit(me, them);
  if (location.sameArea) good.push({ text: `Both looking in ${them.area}`, weight: 8 });
  else if (location.sameCity) good.push({ text: `Both in ${them.city}`, weight: 5 });
  else if (location.otherCity) heads.push({ text: `They're looking in ${them.city}`, weight: 10 });

  // Move-in
  const moveIn = moveInFit(me, them);
  if (moveIn.days != null && moveIn.days <= 14) good.push({ text: "Move-in dates are within two weeks", weight: 5 });
  if (moveIn.days != null && moveIn.days > 60) {
    heads.push({ text: `Move-in dates are about ${Math.round(moveIn.days / 30)} months apart`, weight: 5 });
  }

  // Day-to-day traits
  let traitScore = 0;
  let traitWeight = 0;
  for (const t of TRAITS) {
    const a = me[t.key];
    const b = them[t.key];
    traitWeight += t.weight;
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      traitScore += t.weight * 0.6;
      continue;
    }
    const diff = Math.abs(a - b);
    traitScore += t.weight * (1 - diff / 4);
    const avg = (a + b) / 2;
    if (diff <= 1 && avg <= 2) good.push({ text: t.bothLow, weight: t.weight * 0.8 });
    else if (diff <= 1 && avg >= 4) good.push({ text: t.bothHigh, weight: t.weight * 0.8 });
    else if (diff >= 3 || (diff === 2 && t.weight >= 7)) heads.push({ text: t.clash(a, b), weight: t.weight * (diff / 4) });
  }
  const lifestyle = traitWeight ? traitScore / traitWeight : 0.6;

  // Habits
  const smoking = ordinalFit("smoking", me.smoking, them.smoking, [1, 0.6, 0]);
  const drinking = ordinalFit("drinking", me.drinking, them.drinking, [1, 0.75, 0.35]);
  const diet = ordinalFit("diet", me.diet, them.diet, [1, 0.8, 0.6, 0.4]);
  const pets = petsFit(me.pets, them.pets);
  const habits = (smoking * 5 + pets * 3 + diet * 2 + drinking * 2) / 12;

  if (me.smoking === "never" && them.smoking === "never") good.push({ text: "Neither of you smokes", weight: 3 });
  if (smoking === 0) {
    heads.push({ text: me.smoking === "never" ? "They smoke and you don't" : "You smoke and they don't", weight: 8 });
  }
  if (pets === 0) {
    heads.push({ text: me.pets === "allergic" ? "They have a pet and you're allergic" : "You have a pet and they're allergic", weight: 8 });
  }
  if (me.diet && me.diet === them.diet && (me.diet === "veg" || me.diet === "vegan")) {
    good.push({ text: me.diet === "veg" ? "You're both vegetarian" : "You're both vegan", weight: 3 });
  } else if (diet <= 0.6 && me.diet && them.diet) {
    heads.push({ text: "Different diets, so talk about how you'll share the kitchen", weight: 3 });
  }
  if (drinking === 0.35) heads.push({ text: "Different habits around drinking at home", weight: 3 });

  // Interests and languages
  const sharedInterests = shared(me.interests, them.interests);
  const sharedLanguages = shared(me.languages, them.languages);
  const extras = (Math.min(sharedInterests.length, 4) / 4) * 0.75 + (sharedLanguages.length ? 0.25 : 0);
  if (sharedInterests.length) {
    good.push({ text: `You both like ${joinList(sharedInterests.slice(0, 3))}`, weight: 3 + sharedInterests.length });
  }
  const notEnglish = sharedLanguages.filter((l) => norm(l) !== "english");
  if (notEnglish.length) good.push({ text: `You both speak ${joinList(notEnglish.slice(0, 2))}`, weight: 2 });

  const total =
    WEIGHTS.budget * budget.score +
    WEIGHTS.location * location.score +
    WEIGHTS.moveIn * moveIn.score +
    WEIGHTS.housing * housing +
    WEIGHTS.lifestyle * lifestyle +
    WEIGHTS.habits * habits +
    WEIGHTS.extras * extras;

  const byWeight = (x, y) => y.weight - x.weight;
  return {
    score: Math.round(Math.min(100, Math.max(0, total))),
    good: good.sort(byWeight).map((r) => r.text),
    heads: heads.sort(byWeight).map((r) => r.text),
    sharedInterests,
    sharedLanguages,
    parts: { budget: budget.score, location: location.score, moveIn: moveIn.score, housing, lifestyle, habits, extras },
  };
}

function accepts(pref, gender) {
  if (!pref || pref === "any") return true;
  if (pref === "women") return gender === "woman";
  if (pref === "men") return gender === "man";
  return true;
}

/** Both people's roommate preferences have to allow each other. */
export function fitsPreference(me, them) {
  return accepts(me?.pref_gender, them?.gender) && accepts(them?.pref_gender, me?.gender);
}

export function matchWord(score) {
  if (score >= 85) return "Excellent fit";
  if (score >= 70) return "Strong fit";
  if (score >= 55) return "Worth a chat";
  return "Some differences";
}

/** What's missing from a profile, in the order worth fixing. */
export function profileGaps(p) {
  if (!p) return { percent: 0, missing: [] };
  const checks = [
    [Boolean(p.full_name?.trim()), "Your name"],
    [Boolean(p.city), "City"],
    [Boolean(p.housing), "Room situation"],
    [Number.isFinite(p.rent_min) && Number.isFinite(p.rent_max), "Budget"],
    [Boolean(p.move_in), "Move-in date"],
    [Boolean(p.area), "Area or neighbourhood"],
    [Boolean(p.smoking && p.drinking && p.pets && p.diet), "Habits"],
    [Boolean(p.occupation?.trim()), "What you do"],
    [Number.isFinite(p.age), "Age"],
    [(p.interests?.length ?? 0) >= 3, "At least 3 interests"],
    [(p.languages?.length ?? 0) >= 1, "Languages"],
    [(p.bio?.trim().length ?? 0) >= 40, "A short bio"],
    [Boolean(p.avatar_url), "A photo"],
  ];
  const done = checks.filter(([ok]) => ok).length;
  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter(([ok]) => !ok).map(([, label]) => label),
  };
}
