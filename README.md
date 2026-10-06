# RoomieFinder

Find a flatmate you'll actually get along with. People describe how they live (budget, area, move-in date, sleep, tidiness, guests, noise, smoking, pets, food), RoomieFinder scores everyone else against them and explains the score, and two people can chat once they've both accepted a connection.

Built with React 19, React Router 7, Vite and Supabase (Postgres, Auth, Realtime, Storage).

## What's in it

- **Sign in with Google** or email and password, plus password reset. New accounts go through a four-step profile setup.
- **Discover**: everyone who has finished their profile, scored against yours, with filters for city, room situation, rent, move-in window and sorting.
- **Profiles that explain the match**: reasons you'd get along, things worth talking about, and a you-vs-them view of each daily habit.
- **Connections**: send a request with a note; the other person accepts or declines. Messaging only opens between connected people (enforced in the database, not just the UI).
- **Live chat**: messages, read receipts, typing indicator and online status update in real time.
- **Saved list, activity feed, profile photo upload, privacy switches, light and dark themes, account deletion.**
- **Demo mode**: "Explore the demo" runs the whole app in the browser with sample people who accept requests and reply to messages. Nothing is sent to the server.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
```

The app works straight away in demo mode. To sign in for real, set up Supabase below.

`.env` is optional. Without one, the app uses the Supabase project in `src/lib/supabase.js`. To use your own project, copy `.env.example` to `.env` and fill in the URL and anon (publishable) key from Supabase → Project Settings → API.

## 1. Create the database (once)

1. Open your project on [supabase.com](https://supabase.com) → **SQL Editor** → **New query**.
2. Paste everything from [`supabase/schema.sql`](supabase/schema.sql) and press **Run**.

This creates the tables (`members`, `connections`, `chat_messages`, `saved_members`, `activity`), the row level security rules, the triggers that create a profile for every new sign-up, realtime publishing and the `avatars` storage bucket. It's safe to run again.

## 2. Turn on Google sign-in

**In Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)):

1. Create a project (or pick one), then go to **APIs & Services → OAuth consent screen**. Choose **External**, fill in the app name and your email, and save. While the app is in "Testing", add the Google accounts that should be able to sign in as test users, or publish the app.
2. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID → Web application**.
3. Under **Authorized JavaScript origins** add `http://localhost:5173` and your deployed URL (for example `https://roomie-finder.vercel.app`).
4. Under **Authorized redirect URIs** add your Supabase callback:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
   (for the bundled project: `https://hepvnocqlfkhuhsfkdbo.supabase.co/auth/v1/callback`)
5. Create it and copy the **Client ID** and **Client secret**.

**In Supabase**:

1. **Authentication → Sign In / Providers → Google**: switch it on, paste the client ID and secret, save.
2. **Authentication → URL Configuration**: set **Site URL** to your deployed URL, and under **Redirect URLs** add `http://localhost:5173/**` and `https://<your-deployed-domain>/**`.

If Google isn't switched on yet, the "Continue with Google" button says so instead of sending people to an error page.

Email sign-up works without any of this. If **Confirm email** is on (Authentication → Sign In / Providers → Email), new users get a confirmation link that brings them back signed in.

## Deploy

`vercel.json` already rewrites every path to `index.html`, so links like `/messages/…` and the `/auth/callback` page work on refresh. On Vercel: import the repo, framework preset **Vite**, and add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables if you use your own project. Then add the deployed URL in the Google and Supabase settings above.

## How the match score works

`src/lib/match.js` scores each pair out of 100:

| Part | Weight |
| --- | --- |
| Daily habits (sleep, tidiness, social, guests, noise) | 30 |
| Budget overlap | 18 |
| Same city / same area | 14 |
| Smoking, pets, food, drinking | 12 |
| Room situation (has a room + needs a room is ideal) | 10 |
| Move-in dates | 8 |
| Shared interests and languages | 8 |

Unanswered questions count as neutral. Every part also produces plain-language reasons, which the profile page lists. Gender preferences ("women only", "men only") are applied as a filter in both directions, not as part of the score.

## Project layout

```
supabase/schema.sql        tables, security rules, triggers, realtime, storage
src/lib/                   supabase client, match scoring, formatting, options
src/data/supabaseApi.js    all database calls and realtime subscriptions
src/data/demoApi.js        the in-browser demo backend (same interface)
src/context/               auth, app data store, toasts
src/components/            shell, person cards, profile form sections
src/pages/                 landing, auth, onboarding, home, discover, person,
                           connections, messages, saved, activity, profile, settings
src/styles/                design tokens and styles
```
