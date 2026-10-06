// Everything here is shown to people signing in, so it stays plain and non-technical.
export const GOOGLE_OFF_MESSAGE = "Google sign-in isn't available right now. Please use your email instead.";

const RULES = [
  [/invalid login credentials/i, "That email and password don't match. If you signed up with Google, use Continue with Google, or reset your password."],
  [/token has expired or is invalid|otp_expired|invalid otp/i, "That code is wrong or has expired. Check it, or send a new code."],
  [/email not confirmed/i, "Confirm your email first. We sent a link to your inbox when you signed up."],
  [/user already registered|already been registered/i, "There's already an account with this email. Sign in instead."],
  [/password should be|weak password/i, "Use a stronger password with at least 8 characters."],
  [/should be different from the old/i, "Choose a password you haven't used before."],
  [/not authorized|error sending|sending (confirmation|recovery|magic link)/i, "We couldn't send an email to that address. Please try again later."],
  [/email address .* is invalid|invalid email/i, "That email address can't be used. Try a different one."],
  [/signups? (not allowed|disabled)/i, "New sign-ups are closed right now."],
  [/rate limit|too many/i, "Too many attempts. Please wait a few minutes and try again."],
  [/failed to fetch|network|load failed/i, "Couldn't connect. Check your internet connection and try again."],
  [/provider is not enabled|unsupported provider/i, GOOGLE_OFF_MESSAGE],
  [/expired|invalid flow state|code verifier|otp/i, "This link has expired. Please try again."],
];

export function friendlyAuthError(error) {
  const message = String(error?.message || error || "");
  for (const [pattern, text] of RULES) if (pattern.test(message)) return text;
  if (message === GOOGLE_OFF_MESSAGE) return message;
  if (message) console.error("[RoomieFinder] sign-in error:", message);
  return "Something went wrong. Please try again.";
}
