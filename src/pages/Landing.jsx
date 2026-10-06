import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Avatar, Brand, GoogleMark, MatchPlate } from "../components/Bits";
import { DEMO_ME, DEMO_PEOPLE } from "../data/demoPeople";
import { computeMatch, WEIGHTS } from "../lib/match";
import { daysFromNow, rentRange } from "../lib/format";
import { friendlyAuthError } from "../lib/authErrors";
import { HOUSING } from "../lib/options";

const BOARD = ["d04", "d01", "d06", "d05", "d02", "d07"];
const UNITS = ["1A", "1B", "2A", "2B", "3A", "3B"];

const SCORE_PARTS = [
  { key: "lifestyle", label: "Daily habits" },
  { key: "budget", label: "Budget" },
  { key: "location", label: "Location" },
  { key: "habits", label: "Smoking, pets, food" },
  { key: "housing", label: "Room situation" },
  { key: "moveIn", label: "Move-in date" },
  { key: "extras", label: "Interests, languages" },
];

function useBoard() {
  return useMemo(() => {
    const me = { ...DEMO_ME, move_in: daysFromNow(DEMO_ME.move_in) };
    return BOARD.map((id, i) => {
      const p = DEMO_PEOPLE.find((x) => x.id === id);
      const person = { ...p, move_in: daysFromNow(p.move_in) };
      return { ...person, unit: UNITS[i], match: computeMatch(me, person) };
    });
  }, []);
}

function Intercom() {
  const board = useBoard();
  const [picked, setPicked] = useState(board[0].id);
  const current = board.find((p) => p.id === picked);
  const housing = HOUSING.find((h) => h.value === current.housing)?.short;

  return (
    <figure className="intercom" aria-label="Sample matches">
      <figcaption className="intercom-head">Ring a flat to see how a match is explained</figcaption>
      <div className="intercom-plates">
        {board.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={`nameplate ${p.id === picked ? "is-picked" : ""} ${i === 0 ? "rings" : ""}`}
            aria-pressed={p.id === picked}
            onClick={() => setPicked(p.id)}
          >
            <span className="nameplate-unit">{p.unit}</span>
            <span className="nameplate-name">{p.full_name.split(" ")[0]}</span>
            <span className="nameplate-bell" aria-hidden>
              <Bell size={13} />
            </span>
          </button>
        ))}
      </div>
      <div className="intercom-screen" aria-live="polite">
        <div className="intercom-who">
          <Avatar person={current} size={48} />
          <div>
            <p className="intercom-name">
              {current.full_name}, {current.age}
            </p>
            <p className="intercom-sub">
              {housing} in {current.area}, {rentRange(current.rent_min, current.rent_max)}
            </p>
          </div>
          <MatchPlate score={current.match.score} size="sm" />
        </div>
        <ul className="intercom-reasons">
          {current.match.good.slice(0, 3).map((r) => (
            <li key={r}>
              <Check size={15} aria-hidden /> {r}
            </li>
          ))}
        </ul>
        <p className="intercom-note">Scored against a sample student looking for a room in Coimbatore.</p>
      </div>
    </figure>
  );
}

export default function Landing() {
  const { user, signInWithGoogle, startDemo } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const total = Object.values(WEIGHTS).reduce((a, b) => a + b, 0);

  async function google() {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      toast.error(friendlyAuthError(e));
      setBusy(false);
    }
  }

  function demo() {
    startDemo();
    navigate("/home");
  }

  const ctas = user ? (
    <Link to="/home" className="btn btn-brass btn-lg">
      Open RoomieFinder
    </Link>
  ) : (
    <>
      <button type="button" className="btn btn-google btn-lg" onClick={google} disabled={busy}>
        <GoogleMark /> Continue with Google
      </button>
      <button type="button" className="btn btn-quiet-light btn-lg" onClick={demo}>
        Explore the demo
      </button>
    </>
  );

  return (
    <div className="landing">
      <header className="landing-nav">
        <Brand tone="light" />
        <nav className="landing-nav-links">
          {user ? (
            <Link to="/home" className="btn btn-brass btn-sm">
              Open app
            </Link>
          ) : (
            <>
              <Link to="/login" className="landing-signin">
                Sign in
              </Link>
              <Link to="/signup" className="btn btn-brass btn-sm">
                Create account
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <h1 className="display hero-title">Find a flatmate you'll actually get along with.</h1>
          <p className="hero-lede">
            Tell RoomieFinder how you live, from bedtime to dishes to budget. It shows you people looking in your city, explains why
            you'd fit, and opens a chat once you both say yes.
          </p>
          <div className="hero-ctas">{ctas}</div>
          {!user && (
            <p className="hero-small">
              Have an account? <Link to="/login">Sign in with email</Link>
            </p>
          )}
        </div>
        <Intercom />
      </section>

      <section className="steps" aria-labelledby="steps-title">
        <h2 id="steps-title" className="h-page">
          How it works
        </h2>
        <ol className="steps-list">
          <li>
            <span className="step-stud num">1</span>
            <h3 className="h-section">Describe your home life</h3>
            <p>Budget, area and move-in date, plus the things flatmates actually argue about: sleep, mess, guests and noise.</p>
          </li>
          <li>
            <span className="step-stud num">2</span>
            <h3 className="h-section">See who fits, and why</h3>
            <p>Every match lists its reasons, like overlapping budgets or both being night owls, and the things worth talking about first.</p>
          </li>
          <li>
            <span className="step-stud num">3</span>
            <h3 className="h-section">Connect, then chat</h3>
            <p>Send a request with a short note. When they accept, your conversation opens. Your email and phone number stay private.</p>
          </li>
        </ol>
      </section>

      <section className="weights" aria-labelledby="weights-title">
        <div className="weights-copy">
          <h2 id="weights-title" className="h-page">
            What goes into a match
          </h2>
          <p className="lede">
            The score out of 100 is a weighted mix of what you both said. Questions either of you skipped count as neutral, so an
            unfinished profile isn't marked down twice.
          </p>
        </div>
        <div className="weights-bar" role="list">
          {SCORE_PARTS.map((part) => (
            <div key={part.key} role="listitem" className={`weight weight-${part.key}`} style={{ flexGrow: WEIGHTS[part.key] }}>
              <span className="weight-num num">{Math.round((WEIGHTS[part.key] / total) * 100)}</span>
              <span className="weight-label">{part.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="closer">
        <h2 className="display closer-title">Your next flatmate might already be looking.</h2>
        <div className="hero-ctas">{ctas}</div>
      </section>

      <footer className="landing-foot">
        <Brand tone="light" />
        <p>For students and young professionals looking for a place to share.</p>
        <nav className="landing-foot-links">
          <Link to="/login">Sign in</Link>
          <Link to="/signup">Create account</Link>
          <button type="button" className="linklike" onClick={demo}>
            Demo
          </button>
        </nav>
      </footer>
    </div>
  );
}

