import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { matchService } from "../services/matchService";
import { savedService } from "../services/savedService";
import MatchCard from "../components/MatchCard";
import RoommateModal from "../components/RoommateModal";
import "./Matches.css";

function Matches() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [matches, setMatches] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [selectedRoommate, setSelectedRoommate] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await matchService.getMatches(user?.id);
      setMatches(data);
      const saved = await savedService.getSaved(user?.id);
      setSavedIds(new Set(saved.map((r) => String(r.id))));
    }
    load();
  }, [user]);

  async function handleToggleSave(roommate) {
    const res = await savedService.toggleSave(user?.id, roommate);
    setSavedIds(new Set(res.list.map((r) => String(r.id))));
  }

  const displayedMatches = useMemo(() => {
    if (activeTab === "high") {
      return matches.filter((m) => m.compatibility >= 90);
    }
    if (activeTab === "new") {
      return matches.slice(0, 2);
    }
    return matches;
  }, [matches, activeTab]);

  return (
    <div className="matches-page animate-fade-up">
      {/* Header */}
      <section className="matches-header-card">
        <div>
          <span className="matches-eyebrow">YOUR CONNECTIONS</span>
          <h1>Your Roommate Matches</h1>
          <p>
            People who matched with you based on shared preferences, sleep cycles, and location.
          </p>
        </div>

        <div className="matches-count-pill">
          <strong>{matches.length}</strong>
          <span>Total Matches</span>
        </div>
      </section>

      {/* Tabs */}
      <div className="matches-tabs-bar">
        <button
          type="button"
          className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Matches <span className="tab-badge">{matches.length}</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "high" ? "active" : ""}`}
          onClick={() => setActiveTab("high")}
        >
          90%+ Match
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "new" ? "active" : ""}`}
          onClick={() => setActiveTab("new")}
        >
          New Matches <span className="tab-badge-new">2</span>
        </button>
      </div>

      {/* Grid */}
      <section className="matches-grid-section">
        {displayedMatches.length > 0 ? (
          <div className="matches-cards-grid">
            {displayedMatches.map((roommate) => (
              <MatchCard
                key={roommate.id}
                roommate={roommate}
                isSaved={savedIds.has(String(roommate.id))}
                onToggleSave={handleToggleSave}
                onViewProfile={(r) => setSelectedRoommate(r)}
              />
            ))}
          </div>
        ) : (
          <div className="matches-empty-state">
            <div className="empty-heart-icon">♡</div>
            <h3>No matches in this category</h3>
            <p>Explore Discover to find more people matching your rhythm.</p>
          </div>
        )}
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

export default Matches;