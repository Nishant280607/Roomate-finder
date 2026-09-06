import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Sidebar.css";

const primaryMenu = [
  { name: "Dashboard", path: "/dashboard", icon: "⌂" },
  { name: "Discover", path: "/discover", icon: "⌕" },
  { name: "Matches", path: "/matches", icon: "♡" },
  { name: "Messages", path: "/messages", icon: "💬", badge: "4" },
  { name: "Saved", path: "/saved", icon: "☆" },
  { name: "Notifications", path: "/notifications", icon: "🔔", badge: "2" },
];

const accountMenu = [
  { name: "Profile", path: "/profile", icon: "👤" },
  { name: "Settings", path: "/settings", icon: "⚙" },
];

function Sidebar({ isOpen, onClose }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <aside className={`sidebar ${isOpen ? "mobile-open" : ""}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">R</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Roomie</span>
          <span className="sidebar-brand-subtitle">FINDER</span>
        </div>
        {isOpen && (
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="sidebar-section">
        <span className="sidebar-section-title">MAIN MENU</span>
        <nav className="sidebar-nav">
          {primaryMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.name}</span>
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Account Navigation */}
      <div className="sidebar-section sidebar-bottom-section">
        <span className="sidebar-section-title">ACCOUNT</span>
        <nav className="sidebar-nav">
          {accountMenu.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="sidebar-logout-btn"
          onClick={handleLogout}
        >
          <span className="sidebar-icon">↪</span>
          <span>Logout</span>
        </button>
      </div>

      {/* Logged-in User Card */}
      <div className="sidebar-user" onClick={() => navigate("/profile")}>
        <img
          src={profile?.image || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"}
          alt={profile?.name || "User"}
          className="sidebar-user-avatar"
        />
        <div className="sidebar-user-info">
          <strong>{profile?.name || "Alex Morgan"}</strong>
          <span>{profile?.occupation || "Software Developer"}</span>
        </div>
        <span className="sidebar-user-arrow">›</span>
      </div>
    </aside>
  );
}

export default Sidebar;