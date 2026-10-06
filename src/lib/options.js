// Everything a profile can say, in one place. Matching, forms and profile
// pages all read from here so the wording stays consistent.

export const TRAITS = [
  {
    key: "sleep",
    label: "Sleep",
    steps: ["Up by 6", "Early-ish", "Regular hours", "Late-ish", "Night owl"],
    weight: 7,
    bothLow: "You're both early risers",
    bothHigh: "You're both night owls",
    clash: (me, them) =>
      me < them ? "You're up early, they're up late" : "You're up late, they're up early",
  },
  {
    key: "tidiness",
    label: "Tidiness",
    steps: ["Very relaxed", "Relaxed", "Tidy enough", "Tidy", "Spotless"],
    weight: 8,
    bothLow: "Neither of you minds a little mess",
    bothHigh: "You both like things spotless",
    clash: (me, them) => (me > them ? "You're much tidier than they are" : "They're much tidier than you"),
  },
  {
    key: "social",
    label: "At home",
    steps: ["Keep to myself", "Mostly private", "Balanced", "Pretty social", "Very social"],
    weight: 5,
    bothLow: "You both like a quiet, private home",
    bothHigh: "You both like a social home",
    clash: (me, them) =>
      me > them ? "You're more social at home than they are" : "They're more social at home than you",
  },
  {
    key: "guests",
    label: "Guests over",
    steps: ["Almost never", "Rarely", "Sometimes", "Often", "All the time"],
    weight: 5,
    bothLow: "Neither of you has guests over much",
    bothHigh: "You both like having people over",
    clash: (me, them) =>
      me > them ? "You have guests over far more often" : "They have guests over far more often",
  },
  {
    key: "noise",
    label: "Noise",
    steps: ["Need silence", "Prefer quiet", "Don't mind", "Like some buzz", "Loud is fine"],
    weight: 5,
    bothLow: "You both need a quiet place",
    bothHigh: "Neither of you minds some noise",
    clash: (me, them) => (me < them ? "You need quiet, they don't mind noise" : "They need quiet, you don't mind noise"),
  },
];

export const HABITS = {
  smoking: {
    label: "Smoking",
    options: [
      { value: "never", label: "Don't smoke" },
      { value: "outside", label: "Outside only" },
      { value: "yes", label: "Smoke" },
    ],
  },
  drinking: {
    label: "Drinking",
    options: [
      { value: "never", label: "Don't drink" },
      { value: "socially", label: "Socially" },
      { value: "often", label: "Often" },
    ],
  },
  pets: {
    label: "Pets",
    options: [
      { value: "none", label: "No pets" },
      { value: "love", label: "Love pets" },
      { value: "have", label: "Have a pet" },
      { value: "allergic", label: "Allergic" },
    ],
  },
  diet: {
    label: "Food at home",
    options: [
      { value: "vegan", label: "Vegan" },
      { value: "veg", label: "Vegetarian" },
      { value: "egg", label: "Eggetarian" },
      { value: "nonveg", label: "Non-veg" },
    ],
  },
};

export const HOUSING = [
  { value: "has_room", label: "I have a room", short: "Has a room", hint: "You're renting and need someone for the spare room." },
  { value: "need_room", label: "I need a room", short: "Needs a room", hint: "You're looking to move into someone's place." },
  { value: "team_up", label: "Let's find one together", short: "Wants to team up", hint: "You'd rather rent a new place with someone." },
];

export const GENDERS = [
  { value: "woman", label: "Woman" },
  { value: "man", label: "Man" },
  { value: "nonbinary", label: "Non-binary" },
];

export const GENDER_PREFS = [
  { value: "any", label: "Anyone" },
  { value: "women", label: "Women only" },
  { value: "men", label: "Men only" },
];

export const CITIES = {
  Chennai: ["Adyar", "Anna Nagar", "Besant Nagar", "Guindy", "Kilpauk", "Kotturpuram", "Mylapore", "Nungambakkam", "OMR", "Perungudi", "Porur", "Sholinganallur", "T. Nagar", "Taramani", "Thoraipakkam", "Velachery"],
  Bengaluru: ["BTM Layout", "Bellandur", "Domlur", "Electronic City", "HSR Layout", "Indiranagar", "Jayanagar", "Koramangala", "Malleshwaram", "Marathahalli", "Whitefield"],
  Hyderabad: ["Banjara Hills", "Gachibowli", "Hitech City", "Kondapur", "Kukatpally", "Madhapur"],
  Coimbatore: ["Ettimadai", "Gandhipuram", "Peelamedu", "RS Puram", "Saravanampatti"],
  Mumbai: ["Andheri", "Bandra", "Malad", "Powai", "Thane"],
  Pune: ["Baner", "Hinjewadi", "Kothrud", "Koregaon Park", "Viman Nagar", "Wakad"],
  "Delhi NCR": ["Gurugram", "Hauz Khas", "Noida", "Saket"],
  Kochi: ["Edappally", "Kakkanad", "Kaloor", "Panampilly Nagar"],
};

export const INTERESTS = [
  "Art", "Badminton", "Board games", "Coding", "Coffee", "Cooking", "Cricket", "Cycling",
  "Dance", "Films", "Fitness", "Football", "Gaming", "Gardening", "Hiking", "Music",
  "Photography", "Podcasts", "Reading", "Running", "Travel", "Volunteering", "Yoga",
];

export const LANGUAGES = [
  "English", "Tamil", "Hindi", "Telugu", "Kannada", "Malayalam", "Marathi", "Bengali",
  "Gujarati", "Punjabi", "Urdu", "French", "German", "Italian", "Spanish", "Japanese", "Korean", "Arabic",
];

export const RENT_PRESETS = [
  [6000, 9000],
  [9000, 12000],
  [12000, 16000],
  [16000, 22000],
];

export function housingShort(value) {
  return HOUSING.find((h) => h.value === value)?.short ?? "";
}

export function optionLabel(list, value) {
  return list.find((o) => o.value === value)?.label ?? "";
}

export function habitLabel(key, value) {
  return HABITS[key]?.options.find((o) => o.value === value)?.label ?? "Not set";
}

export const EMPTY_PROFILE = {
  full_name: "",
  avatar_url: null,
  age: null,
  gender: null,
  pref_gender: "any",
  occupation: "",
  bio: "",
  city: "",
  area: "",
  housing: null,
  rent_min: null,
  rent_max: null,
  move_in: null,
  sleep: 3,
  tidiness: 3,
  social: 3,
  guests: 3,
  noise: 3,
  smoking: null,
  drinking: null,
  pets: null,
  diet: null,
  interests: [],
  languages: [],
  visible: true,
  show_online: true,
  onboarded: false,
};

/** The parts of a profile that go into a preferences card shared in chat. */
export const PREF_KEYS = [
  "housing", "city", "area", "rent_min", "rent_max", "move_in",
  "sleep", "tidiness", "social", "guests", "noise",
  "smoking", "drinking", "pets", "diet",
];

export function pickPrefs(profile) {
  const out = {};
  for (const key of PREF_KEYS) out[key] = profile?.[key] ?? null;
  return out;
}

/** Columns the app is allowed to write on the members table. */
export const PROFILE_FIELDS = Object.keys(EMPTY_PROFILE);
