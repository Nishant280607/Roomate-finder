import { Link } from "react-router-dom";
import { Brand } from "../components/Bits";

const UPDATED = "7 October 2026";
const REPO = "https://github.com/Nishant280607/Roomate-finder";

function LegalPage({ title, children }) {
  return (
    <div className="legal">
      <header className="legal-top">
        <Brand />
        <Link to="/" className="text-link">
          Back to RoomieFinder
        </Link>
      </header>
      <main className="legal-body">
        <h1 className="h-page">{title}</h1>
        <p className="muted">Last updated {UPDATED}</p>
        {children}
      </main>
    </div>
  );
}

export function Privacy() {
  return (
    <LegalPage title="Privacy policy">
      <p>RoomieFinder helps people find someone to share a home with. This page explains what we collect and what we do with it.</p>

      <h2 className="h-section">What we collect</h2>
      <ul>
        <li>Your name, email address and profile photo, from your Google account or from what you type when you sign up.</li>
        <li>What you add to your profile: age, gender, city and area, budget, move-in date, daily habits, interests, languages and bio.</li>
        <li>Your connection requests, the people you save, and the messages you send.</li>
      </ul>

      <h2 className="h-section">How we use it</h2>
      <ul>
        <li>To show your profile to other members and work out how well you'd get along.</li>
        <li>To let you message people you're connected with.</li>
        <li>Your email address is never shown to other members.</li>
        <li>We don't sell your information or use it for advertising.</li>
      </ul>

      <h2 className="h-section">Who can see what</h2>
      <ul>
        <li>Signed-in members can see your profile, unless you turn off "Show me in Discover" in Settings.</li>
        <li>Your messages can only be read by you and the person you're talking to.</li>
        <li>Your saved list is visible only to you.</li>
      </ul>

      <h2 className="h-section">Signing in with Google</h2>
      <p>When you continue with Google, we receive only your name, email address and profile photo. We can't see your Google password or anything else in your account.</p>

      <h2 className="h-section">Where it's stored</h2>
      <p>Your information is stored securely with our hosting provider, Supabase.</p>

      <h2 className="h-section">Deleting your data</h2>
      <p>Go to Settings and choose Delete account. This permanently removes your profile, connections, saved list and messages.</p>

      <h2 className="h-section">Questions</h2>
      <p>
        Get in touch through our <a href={REPO}>project page</a>.
      </p>
    </LegalPage>
  );
}

export function Terms() {
  return (
    <LegalPage title="Terms of use">
      <p>By using RoomieFinder you agree to these terms.</p>

      <h2 className="h-section">What RoomieFinder does</h2>
      <p>RoomieFinder helps you find people to share a home with. We don't check anyone's identity, inspect homes, or handle rent or deposits.</p>

      <h2 className="h-section">Stay safe</h2>
      <ul>
        <li>Meet in a public place before agreeing anything.</li>
        <li>See the home in person before you pay.</li>
        <li>Never send money to someone you haven't met.</li>
      </ul>

      <h2 className="h-section">Be respectful</h2>
      <p>No harassment, fake profiles, spam or discrimination. We may remove accounts that break these rules.</p>

      <h2 className="h-section">Your account</h2>
      <p>Keep your sign-in details to yourself. You can delete your account at any time from Settings.</p>

      <h2 className="h-section">No guarantees</h2>
      <p>RoomieFinder is a student project provided as it is. We can't guarantee it will always be available or that every match will work out.</p>
    </LegalPage>
  );
}
