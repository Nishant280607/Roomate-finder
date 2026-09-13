import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationService } from "../services/notificationService";
import "./Navbar.css";

function Navbar({ onToggleSidebar }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === "/";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      notificationService.getNotifications(user.id).then((notifs) => {
        const count = notifs.filter((n) => !n.read).length;
        setUnreadCount(count);
      });
    }
  }, [user, location.pathname]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  // If on landing page (public)
  if (isLanding) {
    return (
      <header className={`landing-navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-brand">
            <div className="brand-logo-mark">R</div>
            <span className="brand-name">
              Roomie<span className="brand-accent">Finder</span>
            </span>
          </Link>

          <nav className={`nav-links ${mobileMenuOpen ? "mobile-active" : ""}`}>
            <a href="#hero" onClick={() => setMobileMenuOpen(false)}>
              Home
            </a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>
              How It Works
            </a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)}>
              Features
            </a>
            <Link to="/discover" onClick={() => setMobileMenuOpen(false)}>
              Discover
            </Link>

            <div className="mobile-auth-actions">
              {!user ? (
                <>
                  <Link to="/login" className="btn-nav-login" onClick={() => setMobileMenuOpen(false)}>
                    Log In
                  </Link>
                  <Link to="/register" className="btn-nav-signup" onClick={() => setMobileMenuOpen(false)}>
                    Get Started →
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn-nav-signup" onClick={() => setMobileMenuOpen(false)}>
                  Go to Dashboard →
                </Link>
              )}
            </div>
          </nav>

          <div className="navbar-desktop-actions">
            {!user ? (
              <>
                <Link to="/login" className="btn-nav-login">
                  Log In
                </Link>
                <Link to="/register" className="btn-nav-signup">
                  Get Started →
                </Link>
              </>
            ) : (
              <div className="nav-user-badge">
                <Link to="/dashboard" className="btn-nav-signup">
                  Dashboard →
                </Link>
                <button type="button" onClick={handleLogout} className="btn-nav-logout" title="Log Out">
                  ↪
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>
    );
  }

  // If in dashboard layout (authenticated)
  return (
    <header className="dashboard-topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar Navigation"
        >
          ☰
        </button>

        <div className="topbar-search">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search roommates, locations, interests..."
            onClick={() => {
              if (location.pathname !== "/discover") navigate("/discover");
            }}
          />
        </div>
      </div>

      <div className="topbar-right">
        <Link to="/notifications" className="topbar-icon-btn" aria-label="Notifications">
          <span>🔔</span>
          {unreadCount > 0 && <span className="topbar-badge">{unreadCount}</span>}
        </Link>

        <Link to="/messages" className="topbar-icon-btn" aria-label="Messages">
          <span>💬</span>
          <span className="topbar-badge">4</span>
        </Link>

        <div className="topbar-divider"></div>

        <Link to="/profile" className="topbar-user-pill">
          <img
            src={profile?.image || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"}
            alt={profile?.name || "User"}
            className="topbar-avatar"
          />
          <div className="topbar-user-meta">
            <span className="topbar-user-name">{profile?.name || "Alex Morgan"}</span>
            <span className="topbar-user-role">{profile?.occupation || "Roommate"}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;