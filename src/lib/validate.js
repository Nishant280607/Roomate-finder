import { daysFromNow } from "./format";

/** Returns field errors for the parts of the profile matching needs. */
export function validateProfile(draft, sections = ["basics", "search"]) {
  const errors = {};
  if (sections.includes("basics")) {
    if (!draft.full_name?.trim()) errors.full_name = "Add your name so people know who they're talking to.";
    if (draft.age != null && (draft.age < 16 || draft.age > 99)) errors.age = "Enter an age between 16 and 99.";
    if (draft.age == null) errors.age = "Add your age.";
  }
  if (sections.includes("search")) {
    if (!draft.housing) errors.housing = "Choose what you're looking for.";
    if (!draft.city?.trim()) errors.city = "Add the city you're looking in.";
    if (draft.rent_min == null || draft.rent_max == null) errors.rent = "Add a rent range.";
    else if (draft.rent_min > draft.rent_max) errors.rent = "The first amount should be lower than the second.";
    if (!draft.move_in) errors.move_in = "Pick a rough move-in date.";
  }
  return errors;
}

export function defaultMoveIn() {
  return daysFromNow(30);
}
