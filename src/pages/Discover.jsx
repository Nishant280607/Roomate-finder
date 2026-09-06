import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { roommateService } from "../services/roommateService";
import { savedService } from "../services/savedService";
import RoommateCard from "../components/RoommateCard";
import RoommateModal from "../components/RoommateModal";
import "./Discover.css";

function Discover() {
  const { user } = useAuth();
  const [roommates, setRoommates] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [selectedRoommate, setSelectedRoommate] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All locations");
  const [lifestyle, setLifestyle] = useState("All");
  const [minMatch, setMinMatch] = useState(0);
  const [sortBy, setSortBy] = useState("match");

  useEffect(() => {
    async function load() {
      const data = await roommateService.getRoommates(user?.id);
      setRoommates(data);
      const saved = await savedService.getSaved(user?.id);
      setSavedIds(new Set(saved.map((r) => String(r.id))));
    }
    load();
  }, [user]);

  async function handleToggleSave(roommate) {
    const res = await savedService.toggleSave(user?.id, roommate);
    setSavedIds(new Set(res.list.map((r) => String(r.id))));
  }

  const filteredRoommates = useMemo(() => {
    return roommates
      .filter((r) => {
        const query = search.toLowerCase();
        const matchesQuery =
          r.name.toLowerCase().includes(query) ||
          r.occupation.toLowerCase().includes(query) ||
          (r.interests && r.interests.some((i) => i.toLowerCase().includes(query))) ||
          r.location.toLowerCase().includes(query);

        const matchesLocation =
          location === "All locations" || r.location.includes(location);

        const matchesLifestyle =
          lifestyle === "All" ||
          (r.lifestyle && r.lifestyle.toLowerCase().includes(lifestyle.toLowerCase()));

        const matchesCompatibility = r.compatibility >= Number(minMatch);

        return (
          matchesQuery &&
          matchesLocation &&
          matchesLifestyle &&
          matchesCompatibility
        );
      })
      .sort((a, b) => {
        if (sortBy === "match") return b.compatibility - a.compatibility;
        if (sortBy === "age") return a.age - b.age;
        return 0;
      });
  }, [roommates, search, location, lifestyle, minMatch, sortBy]);

  return (
    <div className="discover-page animate-fade-up">
      {/* Header */}
      <section className="discover-header-card">
        <div>
          <span className="discover-eyebrow">FIND YOUR VIBE</span>
          <h1>Discover Roommates</h1>
          <p>
            Explore verified profiles filtered by lifestyle, personality, and location compatibility.
          </p>
        </div>

        <div className="discover-count-badge">
          <strong>{filteredRoommates.length}</strong>
          <span>People Matching</span>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="discover-filters-panel">
        <div className="discover-search-input-box">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search by name, occupation, hobbies (e.g. Yoga, Coding, Coffee)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch("")}
            >
              ✕
            </button>
          )}
        </div>

        <div className="discover-filter-controls">
          <div className="filter-select-group">
            <label>Location</label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option>All locations</option>
              <option>New York, NY</option>
              <option>Brooklyn, NY</option>
              <option>Queens, NY</option>
              <option>Manhattan, NY</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label>Lifestyle</label>
            <select
              value={lifestyle}
              onChange={(e) => setLifestyle(e.target.value)}
            >
              <option>All</option>
              <option>Clean</option>
              <option>Social</option>
              <option>Quiet</option>
              <option>Balanced</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label>Min Compatibility</label>
            <select
              value={minMatch}
              onChange={(e) => setMinMatch(e.target.value)}
            >
              <option value="0">Any %</option>
              <option value="85">85%+</option>
              <option value="90">90%+</option>
              <option value="95">95%+</option>
            </select>
          </div>

          <div className="filter-select-group">
            <label>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="match">Highest Match</option>
              <option value="age">Age (Youngest)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Roommates Grid */}
      <section className="discover-results-area">
        {filteredRoommates.length > 0 ? (
          <div className="discover-cards-grid">
            {filteredRoommates.map((roommate) => (
              <RoommateCard
                key={roommate.id}
                roommate={roommate}
                isSaved={savedIds.has(String(roommate.id))}
                onToggleSave={handleToggleSave}
                onViewProfile={(r) => setSelectedRoommate(r)}
              />
            ))}
          </div>
        ) : (
          <div className="discover-empty-state">
            <div className="empty-icon-circle">⌕</div>
            <h3>No roommates found matching your filters</h3>
            <p>Try clearing your search terms or lowering the minimum match threshold.</p>
            <button
              type="button"
              className="btn-reset-filters"
              onClick={() => {
                setSearch("");
                setLocation("All locations");
                setLifestyle("All");
                setMinMatch(0);
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* Detail Modal */}
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

export default Discover;