import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roommateService } from "../services/roommateService";
import { savedService } from "../services/savedService";
import { matchService } from "../services/matchService";
import { notificationService } from "../services/notificationService";
import StatCard from "../components/StatCard";
import MatchCard from "../components/MatchCard";
import NotificationCard from "../components/NotificationCard";
import RoommateModal from "../components/RoommateModal";
import "./Dashboard.css";

function Dashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const [topMatches, setTopMatches] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [selectedRoommate, setSelectedRoommate] = useState(null);
  const [stats, setStats] = useState([
    { title: "Matches", value: "12", description: "+3 this week", icon: "♡", trend: "positive" },
    { title: "Saved", value: "8", description: "+2 this week", icon: "☆", trend: "positive" },
    { title: "Messages", value: "4", description: "2 unread", icon: "💬", trend: "neutral" },
    { title: "Compatibility", value: "94%", description: "Your average", icon: "✦", trend: "positive" },
  ]);

  useEffect(() => {
    async function loadData() {
      const roommates = await roommateService.getRoommates(user?.id);
      setTopMatches(roommates.slice(0, 3));

      const savedList = await savedService.getSaved(user?.id);
      setSavedIds(new Set(savedList.map((r) => String(r.id))));

      const matches = await matchService.getMatches(user?.id);
      const notifs = await notificationService.getNotifications(user?.id);
      setRecentNotifications(notifs.slice(0, 3));

      setStats([
        { title: "Matches", value: String(matches.length || 12), description: "+3 this week", icon: "♡", trend: "positive" },
        { title: "Saved", value: String(savedList.length || 8), description: "+2 this week", icon: "☆", trend: "positive" },
        { title: "Messages", value: "4", description: "2 unread", icon: "💬", trend: "neutral" },
        { title: "Compatibility", value: "94%", description: "Your average", icon: "✦", trend: "positive" },
      ]);
    }
    loadData();
  }, [user]);

  async function handleToggleSave(roommate) {
    const result = await savedService.toggleSave(user?.id, roommate);
    setSavedIds(new Set(result.list.map((r) => String(r.id))));
  }

  function handleMarkRead(notifId) {
    notificationService.markRead(user?.id, notifId).then((updated) => {
      setRecentNotifications(updated.slice(0, 3));
    });
  }

  const firstName = profile?.name ? profile.name.split(" ")[0] : "Alex";

  return (
    <div className="dashboard-view animate-fade-up">
      <section className="dash-hero-header">
        <div>
          <span className="dash-eyebrow">YOUR COMMAND CENTER</span>
          <h1 className="dash-greeting">
            Good morning, {firstName} <span className="wave-hand">👋</span>
          </h1>
          <p className="dash-subtext">
            Here's what's happening with your roommate search today.
          </p>
        </div>

        <div className="dash-header-actions">
          <Link to="/discover" className="btn-dash-primary">
            + Discover Roommates
          </Link>
          <Link to="/profile" className="btn-dash-secondary">
            Edit Profile
          </Link>
        </div>
      </section>

      <section className="dash-stats-grid">
        {stats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </section>

      <section className="dash-quick-actions-bar">
        <button
          type="button"
          className="quick-action-btn"
          onClick={() => navigate("/discover")}
        >
          <span className="action-icon">⌕</span>
          <span>Discover Roommates</span>
        </button>
        <button
          type="button"
          className="quick-action-btn"
          onClick={() => navigate("/matches")}
        >
          <span className="action-icon">♡</span>
          <span>View Matches</span>
        </button>
        <button
          type="button"
          className="quick-action-btn"
          onClick={() => navigate("/messages")}
        >
          <span className="action-icon">💬</span>
          <span>Open Messages</span>
        </button>
        <button
          type="button"
          className="quick-action-btn"
          onClick={() => navigate("/profile")}
        >
          <span className="action-icon">👤</span>
          <span>Update Lifestyle</span>
        </button>
      </section>

      <section className="dash-section">
        <div className="dash-section-header">
          <div>
            <span className="dash-section-eyebrow">HIGH COMPATIBILITY</span>
            <h2>Top Recommended Roommates</h2>
            <p>People sharing your sleep schedule, budget, and neighborhood preferences.</p>
          </div>
          <Link to="/discover" className="dash-view-all-link">
            View All Roommates →
          </Link>
        </div>

        <div className="dash-matches-grid">
          {topMatches.map((roommate) => (
            <MatchCard
              key={roommate.id}
              roommate={roommate}
              isSaved={savedIds.has(String(roommate.id))}
              onToggleSave={handleToggleSave}
              onViewProfile={(r) => setSelectedRoommate(r)}
            />
          ))}
        </div>
      </section>

      <section className="dash-bottom-grid">
        <div className="dash-card dash-activity-box">
          <div className="dash-card-header">
            <div>
              <span className="dash-section-eyebrow">UPDATES</span>
              <h3>Recent Activity</h3>
            </div>
            <Link to="/notifications" className="card-header-link">
              All Activity
            </Link>
          </div>

          <div className="activity-cards-list">
            {recentNotifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onRead={handleMarkRead}
              />
            ))}
          </div>
        </div>

        <div className="dash-card dash-strength-box">
          <div className="dash-card-header">
            <div>
              <span className="dash-section-eyebrow">PROFILE COMPLETION</span>
              <h3>Profile Strength</h3>
            </div>
            <span className="strength-percentage">86%</span>
          </div>

          <div className="strength-progress-track">
            <div className="strength-progress-fill" style={{ width: "86%" }}></div>
          </div>

          <p className="strength-tips">
            Adding your exact move-in date and sleep habits boosts recommendation accuracy by 24%.
          </p>

          <div className="strength-checklist">
            <div className="checklist-item done">✓ Basic details & photos verified</div>
            <div className="checklist-item done">✓ Budget & neighborhood set</div>
            <div className="checklist-item done">✓ Cleanliness & lifestyle defined</div>
            <div className="checklist-item pending">○ Link university or workplace</div>
          </div>

          <Link to="/profile" className="btn-strength-cta">
            Complete Profile Now →
          </Link>
        </div>
      </section>

      {selectedRoommate && (
        <RoommateModal
          roommate={selectedRoommate}
          isSaved={savedIds.has(String(selectedRoommate.id))}
          onToggleSave={handleToggleSave}
          onClose={() => setSelectedRoommate(null)}
        />
      )}
    </div>
  );
}

export default Dashboard;