// Everything here is shown to people signing in, so it says exactly what
// happened in plain words. Raw errors go to the browser console only.

export const GOOGLE_OFF_MESSAGE = "Google sign-in isn't available right now. Please use your email instead.";

export const MESSAGES = {
  noAccount: "There's no account with this email. Check it for typos, or create an account.",
  wrongPassword: "Incorrect password. Try again, or use Forgot password.",
  wrongEmailOrPassword: "Incorrect email or password.",
  usesGoogle: "This email is registered with Google. Use Continue with Google instead.",
  alreadyRegistered: "This email is already registered. Sign in instead.",
  alreadyRegisteredGoogle: "This email is already registered with Google. Use the Google button instead.",
  googleNoPassword: "This email signs in with Google, so it has no password to reset. Use Continue with Google.",
  offline: "No internet connection. Check your connection and try again.",
};

/** An error whose message is already written for people, not developers. */
export class FriendlyError extends Error {}
export const friendly = (text) => new FriendlyError(text);

const BY_CODE = {
  invalid_credentials: MESSAGES.wrongEmailOrPassword,
  email_not_confirmed: "Your email isn't confirmed yet. Open the link we emailed you, then sign in.",
  user_already_exists: MESSAGES.alreadyRegistered,
  email_exists: MESSAGES.alreadyRegistered,
  identity_already_exists: "This Google account is already linked to another RoomieFinder account.",
  weak_password: "That password is too easy to guess. Use at least 8 characters with letters and numbers.",
  same_password: "Your new password must be different from your old one.",
  otp_expired: "That code is wrong or has expired. Check it, or send a new code.",
  over_email_send_rate_limit: "Too many emails have been sent to this address. Please wait a few minutes and try again.",
  over_request_rate_limit: "Too many attempts. Please wait a minute and try again.",
  signup_disabled: "New sign-ups are closed right now.",
  email_provider_disabled: "Signing in with email is turned off right now. Use Continue with Google.",
  provider_disabled: GOOGLE_OFF_MESSAGE,
  email_address_invalid: "That email address isn't valid. Check it for typos.",
  email_address_not_authorized: "We couldn't send an email to this address. Please try again later.",
  session_expired: "Your session has expired. Please sign in again.",
  session_not_found: "Your session has expired. Please sign in again.",
  refresh_token_not_found: "Your session has expired. Please sign in again.",
  refresh_token_already_used: "Your session has expired. Please sign in again.",
  user_not_found: "We couldn't find your account. Please sign in again.",
  user_banned: "This account has been suspended.",
  flow_state_expired: "This sign-in link has expired. Please try again.",
  flow_state_not_found: "This sign-in link has expired. Please try again.",
  bad_oauth_state: "Google sign-in didn't finish. Please try again.",
  bad_oauth_callback: "Google sign-in didn't finish. Please try again.",
  request_timeout: "That took too long. Check your connection and try again.",
};

// For error messages that arrive without a code.
const BY_MESSAGE = [
  [/invalid login credentials/i, MESSAGES.wrongEmailOrPassword],
  [/email not confirmed/i, BY_CODE.email_not_confirmed],
  [/user already registered|already been registered|already exists/i, MESSAGES.alreadyRegistered],
  [/password should be|weak password|easy to guess/i, BY_CODE.weak_password],
  [/should be different from the old/i, BY_CODE.same_password],
  [/token has expired or is invalid|otp_expired|invalid otp/i, BY_CODE.otp_expired],
  [/email rate limit/i, BY_CODE.over_email_send_rate_limit],
  [/rate limit|too many/i, BY_CODE.over_request_rate_limit],
  [/not authorized|error sending/i, BY_CODE.email_address_not_authorized],
  [/email address .* is invalid|invalid format|invalid email/i, BY_CODE.email_address_invalid],
  [/signups? (not allowed|disabled)/i, BY_CODE.signup_disabled],
  [/provider is not enabled|unsupported provider/i, GOOGLE_OFF_MESSAGE],
  [/failed to fetch|networkerror|load failed|network request failed/i, MESSAGES.offline],
  [/expired|invalid flow state|code verifier/i, "This link has expired. Please try again."],
];

export function friendlyAuthError(error, fallback = "We couldn't do that right now. Please try again.") {
  if (error instanceof FriendlyError) return error.message;
  const message = String(error?.message || error || "");
  const code = String(error?.code || "");
  if (message) console.error("[RoomieFinder] sign-in error:", code || "", message);

  const wait = message.match(/after (\d+) seconds?/i);
  if (wait) return `Please wait ${wait[1]} seconds before trying again.`;
  if (BY_CODE[code]) return BY_CODE[code];
  for (const [pattern, text] of BY_MESSAGE) if (pattern.test(message)) return text;
  if (error?.name === "AuthRetryableFetchError") return MESSAGES.offline;
  return fallback;
}

export function isInvalidCredentials(error) {
  return error?.code === "invalid_credentials" || /invalid login credentials/i.test(String(error?.message || ""));
}

export function isAlreadyRegistered(error) {
  return ["user_already_exists", "email_exists"].includes(error?.code) || /already registered|already exists/i.test(String(error?.message || ""));
}
