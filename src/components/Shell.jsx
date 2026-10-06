import { Link, NavLink, Navigate, Outlet, useLocation, useMatch, useNavigate } from "react-router-dom";
import { Bell, Bookmark, Compass, House, LogOut, MessageCircle, Settings, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { Avatar, Brand, Splash } from "./Bits";
import SetupNotice from "./SetupNotice";

const NAV = [
  { to: "/home", label: "Home", icon: House },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/connections", label: "Connections", icon: Users, count: "requests" },
  { to: "/messages", label: "Messages", icon: MessageCircle, count: "unreadMessages" },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/activity", label: "Activity", icon: Bell, count: "unreadActivity" },
];

export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function PublicOnly({ children }) {
  const { user, loading, holding } = useAuth();
  const location = useLocation();
  if (loading) return <Splash />;
  if (user && !holding) return <Navigate to={location.state?.from || "/home"} replace />;
  return children;
}

/** Waits for the member's data, then sends new members through onboarding. */
export function AppGate({ children }) {
  const { status, me, loadError, retry } = useStore();
  const { signOut } = useAuth();
  const onWelcome = useMatch("/welcome");

  if (status === "loading") return <Splash text="Getting your matches ready" />;
  if (status === "needs-setup") return <SetupNotice />;
  if (status === "error") {
    return (
      <div className="splash">
        <div className="panel panel-pad gate-error">
          <h1 className="h-section">Couldn't load your account</h1>
          <p className="muted">{loadError}</p>
          <div className="action-row">
            <button type="button" className="btn btn-primary" onClick={retry}>
              Try again
            </button>
            <button type="button" className="btn btn-quiet" onClick={signOut}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!me?.onboarded && !onWelcome) return <Navigate to="/welcome" replace />;
  if (me?.onboarded && onWelcome) return <Navigate to="/home" replace />;
  return children;
}

function NavItems({ counts, variant }) {
  const items = variant === "bar" ? NAV.filter((n) => n.to !== "/activity") : NAV;
  return items.map(({ to, label, icon: Icon, count }) => {
    const n = count ? counts[count] : 0;
    return (
      <NavLink key={to} to={to} className="nav-link">
        <Icon size={20} aria-hidden />
        <span className="nav-label">{label}</span>
        {n > 0 && (
          <span className="badge" aria-label={`${n} new`}>
            {n > 9 ? "9+" : n}
          </span>
        )}
      </NavLink>
    );
  });
}

export function AppShell() {
  const { me, counts, mode } = useStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const inThread = useMatch("/messages/:id");

  async function handleSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }

  return (
    <div className={`shell ${inThread ? "shell-thread" : ""}`}>
      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <aside className="rail" aria-label="Main">
        <div className="rail-brand">
          <Brand to="/home" tone="light" />
        </div>
        <nav className="rail-nav">
          <NavItems counts={counts} />
        </nav>
        <div className="rail-foot">
          <Link to="/profile" className="rail-me">
            <Avatar person={me} size={36} />
            <span>
              <strong>{me?.full_name || "Your profile"}</strong>
              <small>View and edit profile</small>
            </span>
          </Link>
          <div className="rail-tools">
            <NavLink to="/settings" className="nav-link nav-link-small">
              <Settings size={18} aria-hidden />
              <span className="nav-label">Settings</span>
            </NavLink>
            <button type="button" className="nav-link nav-link-small" onClick={handleSignOut}>
              <LogOut size={18} aria-hidden />
              <span className="nav-label">{mode === "demo" ? "Leave demo" : "Sign out"}</span>
            </button>
          </div>
        </div>
      </aside>

      <header className="topbar">
        <Brand to="/home" />
        <div className="topbar-tools">
          <Link to="/activity" className="icon-btn" aria-label={`Activity${counts.unreadActivity ? `, ${counts.unreadActivity} new` : ""}`}>
            <Bell size={18} aria-hidden />
            {counts.unreadActivity > 0 && <span className="dot" aria-hidden />}
          </Link>
          <Link to="/settings" className="icon-btn" aria-label="Settings">
            <Settings size={18} aria-hidden />
          </Link>
          <Link to="/profile" aria-label="Your profile" className="topbar-me">
            <Avatar person={me} size={36} />
          </Link>
        </div>
      </header>

      <main id="main" className="main">
        {mode === "demo" && (
          <div className="demo-strip">
            <span>You're exploring with sample profiles. Nothing here is shared.</span>
            <button type="button" className="text-link" onClick={handleSignOut}>
              Sign in to meet real people
            </button>
          </div>
        )}
        <Outlet />
      </main>

      <nav className="tabbar" aria-label="Main">
        <NavItems counts={counts} variant="bar" />
      </nav>
    </div>
  );
}
