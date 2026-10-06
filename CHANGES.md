# Review notes and what changed

## Problems found in the previous version

**Login and accounts**
- Every new account was filled in with the sample profile's details (Brooklyn, "Software Developer", Alex Morgan's bio, budget and photo) because `DEFAULT_PROFILE` was merged into every profile on sign-up and on load.
- "Continue with Google" only showed an error message; Google sign-in was never wired up.
- Sign-up didn't handle email confirmation: it showed "Account created" and navigated to the dashboard even when Supabase hadn't created a session.
- No password reset.
- The demo login wrote a fake user into the same code path as real accounts, so real and demo data mixed in `localStorage`.
- `src/testSupabase.js` queried the database on every page load and logged the result.

**Data and logic**
- Discover filled in missing database fields with sample people's data (`fallback = roommateData[index]`), so real users appeared with someone else's photo, interests and bio.
- Compatibility was made up: `88 + ((index * 3) % 11)` for database users and fixed numbers for sample users. Nothing compared two people.
- Matches and Saved only ever returned the hard-coded sample people, even when the database had rows, and every account started with the same three "matches".
- Messages never left the browser: conversations were hard-coded, sends went to `localStorage`, and a random canned reply was faked after 1.4 seconds. Two real users could not talk to each other.
- Profile edits weren't saved (Profile page kept its own local copy and the Save button only closed edit mode). Settings toggles and Change password did nothing.
- Notifications page ignored the notification service and used its own hard-coded list.
- Badge counts ("4" messages, "2" notifications) and dashboard stats ("12 matches", "94%", "86% profile strength") were hard-coded.
- No database schema or security rules were in the repo, so it wasn't clear who could read or change what.

**Repo**
- `README.md` contained unresolved git merge conflict markers.
- `vercel.json` (and the identical `New Text Document.txt`) was a Vercel config for a `client/` and `server/` folder that don't exist; the app had no SPA rewrite, so refreshing any page other than `/` on Vercel would 404.
- `frontend` was a broken submodule link (no `.gitmodules`), left over from an earlier commit; it showed as an empty, unclickable folder on GitHub.
- `.gitignore.txt` duplicated `.gitignore`; `ChatBox.jsx` imported a file name with the wrong case and wasn't used; `App.css`, `global.css`, `animations.css`, `hero.png` and `icons.svg` were unused.

## What it does now

- Google and email sign-in, email confirmation, password reset, and a four-step profile setup for new accounts. Google accounts start with their name and photo filled in.
- `supabase/schema.sql`: tables, row level security (tested), triggers that create profiles and activity entries, account deletion, realtime and photo storage.
- A real match score with reasons, applied to real profiles. Gender preferences are respected in both directions.
- Connection requests between real users, with accept, decline and withdraw. Messaging is only allowed between connected people, and that's enforced in the database.
- Live chat with read receipts, typing and online status; live updates for requests and activity.
- Completely new interface and design, responsive down to phone width, with light and dark themes.
- Demo mode kept, but separate from real accounts and clearly marked.
