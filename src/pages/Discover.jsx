import { useMemo, useState } from "react";
import { roommateData } from "../data/mockData";
import RoommateCard from "../components/RoommateCard";
import "./Discover.css";

function Discover() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All locations");
  const [minMatch, setMinMatch] = useState(0);

  const filteredRoommates = useMemo(() => {
    return roommateData.filter((roommate) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        roommate.name.toLowerCase().includes(searchValue) ||
        roommate.occupation.toLowerCase().includes(searchValue) ||
        roommate.interests.some((interest) =>
          interest.toLowerCase().includes(searchValue)
        );

      const matchesLocation =
        location === "All locations" ||
        roommate.location.includes(location);

      const matchesCompatibility =
        roommate.compatibility >= Number(minMatch);

      return (
        matchesSearch &&
        matchesLocation &&
        matchesCompatibility
      );
    });
  }, [search, location, minMatch]);

  return (
    <div className="discover-page">

      {/* Page Header */}
      <section className="discover-header">
        <div>
          <span className="discover-eyebrow">
            FIND YOUR PERFECT MATCH
          </span>

          <h1>Discover Roommates</h1>

          <p>
            Explore people who could be a great match for your
            lifestyle and living preferences.
          </p>
        </div>

        <div className="discover-result-count">
          <strong>{filteredRoommates.length}</strong>
          <span>people found</span>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="discover-filters">

        <div className="search-box">
          <span className="search-icon">⌕</span>

          <input
            type="text"
            placeholder="Search by name, interest, or occupation..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() => setSearch("")}
            >
              ×
            </button>
          )}
        </div>

        <div className="filter-row">

          <div className="filter-group">
            <label htmlFor="location">Location</label>

            <select
              id="location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            >
              <option>All locations</option>
              <option>New York</option>
              <option>Brooklyn</option>
              <option>Queens</option>
              <option>Manhattan</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="match">Minimum Match</label>

            <select
              id="match"
              value={minMatch}
              onChange={(event) => setMinMatch(event.target.value)}
            >
              <option value="0">Any match</option>
              <option value="80">80%+</option>
              <option value="85">85%+</option>
              <option value="90">90%+</option>
              <option value="95">95%+</option>
            </select>
          </div>

          <button
            type="button"
            className="advanced-filter"
          >
            <span>☷</span>
            More filters
          </button>

        </div>
      </section>

      {/* Results */}
      <section className="discover-results">

        <div className="results-heading">
          <div>
            <h2>Recommended for you</h2>
            <p>
              Based on your profile and preferences
            </p>
          </div>

          <select className="sort-select" defaultValue="match">
            <option value="match">
              Best Match
            </option>

            <option value="recent">
              Recently Active
            </option>

            <option value="location">
              Closest Location
            </option>
          </select>
        </div>

        {filteredRoommates.length > 0 ? (
          <div className="discover-grid">
            {filteredRoommates.map((roommate) => (
              <RoommateCard
                key={roommate.id}
                roommate={roommate}
              />
            ))}
          </div>
        ) : (
          <div className="empty-discover">
            <div className="empty-icon">⌕</div>

            <h3>No roommates found</h3>

            <p>
              Try changing your search or filters to find more
              people.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setLocation("All locations");
                setMinMatch(0);
              }}
            >
              Clear filters
            </button>
          </div>
        )}

      </section>
    </div>
  );
}

export default Discover;