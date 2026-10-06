export const GOOGLE_OFF_MESSAGE =
  "Google sign-in isn't switched on for this project yet. In Supabase, open Authentication → Sign In / Providers → Google, turn it on and paste your Google client ID and secret (see README).";

export function friendlyAuthError(error) {
  const message = String(error?.message || error || "");
  if (/invalid login credentials/i.test(message)) return "That email and password don't match an account. Check them, or create an account.";
  if (/email not confirmed/i.test(message)) return "Confirm your email first. We sent a link to your inbox when you signed up.";
  if (/user already registered/i.test(message)) return "There's already an account with this email. Sign in instead.";
  if (/password should be at least/i.test(message)) return "Use a password with at least 8 characters.";
  if (/rate limit|too many/i.test(message)) return "Too many attempts. Wait a minute and try again.";
  if (/failed to fetch|network/i.test(message)) return "Couldn't reach the server. Check your connection and try again.";
  if (/provider is not enabled|unsupported provider/i.test(message)) return GOOGLE_OFF_MESSAGE;
  return message || "Something went wrong. Try again.";
}
