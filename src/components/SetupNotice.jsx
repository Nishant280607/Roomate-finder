import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Brand, BrandMark } from "./Bits";
import AccountChip from "./AccountChip";

/** Shown when the app's database hasn't been set up yet. Kept friendly; the fix is logged for the developer. */
export default function SetupNotice() {
  const { signOut, startDemo } = useAuth();

  useEffect(() => {
    console.warn(
      "[RoomieFinder] The database tables are missing. In Supabase, open SQL Editor, paste supabase/schema.sql from the repository and press Run.",
    );
  }, []);

  return (
    <div className="gate">
      <header className="gate-top">
        <Brand />
        <AccountChip />
      </header>
      <div className="splash">
      <div className="panel panel-pad setup">
        <BrandMark size={40} />
        <h1 className="h-section">We're still getting things ready</h1>
        <p className="muted">Your account is safe. RoomieFinder isn't quite open yet, so please check back a little later.</p>
        <div className="action-row">
          <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>
            Try again
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={async () => {
              await signOut();
              startDemo();
            }}
          >
            Explore the demo
          </button>
          <button type="button" className="btn btn-quiet" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
