import { useAuth } from "../context/AuthContext";
import { BrandMark } from "./Bits";

/** Shown when the Supabase project doesn't have the app's tables yet. */
export default function SetupNotice() {
  const { signOut, startDemo } = useAuth();
  return (
    <div className="splash">
      <div className="panel panel-pad setup">
        <BrandMark size={40} />
        <h1 className="h-section">The database isn't set up yet</h1>
        <p>
          You're signed in, but this Supabase project doesn't have RoomieFinder's tables. Someone with access to the project needs to run
          the setup script once:
        </p>
        <ol className="setup-steps">
          <li>Open your project at supabase.com and go to SQL Editor.</li>
          <li>
            Paste the contents of <code>supabase/schema.sql</code> from the repository and press Run.
          </li>
          <li>Come back here and refresh the page.</li>
        </ol>
        <div className="action-row">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            I've run it, refresh
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={async () => {
              await signOut();
              startDemo();
            }}
          >
            Explore the demo instead
          </button>
        </div>
      </div>
    </div>
  );
}
