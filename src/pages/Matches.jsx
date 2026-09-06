import { useMemo, useState } from "react";
import MatchCard from "../components/MatchCard";
import { roommateData } from "../data/mockData";
import "./Matches.css";

function Matches() {
  const [activeTab, setActiveTab] = useState("all");

  const matches = useMemo(() => {
    if (activeTab === "high") {
      return roommateData.filter(
        (roommate) => roommate.compatibility >= 90
      );
    }

    if (activeTab === "new") {
      return roommateData.slice(0, 2);
    }

    return roommateData;
  }, [activeTab]);

  return (
    <div className="matches-page">

      {/* Header */}
      <section className="matches-header">
        <div>
          <span className="matches-eyebrow">
            YOUR CONNECTIONS
          </span>

          <h1>Your Matches</h1>

          <p>
            People who share your interests and match your
            lifestyle.
          </p>
        </div>

        <div className="matches-total">
          <strong>{roommateData.length}</strong>
          <span>Total matches</span>
        </div>
      </section>

      {/* Tabs */}
      <div className="matches-tabs">
        <button
          type="button"
          className={activeTab === "all" ? "active" : ""}
          onClick={() => setActiveTab("all")}
        >
          All Matches
          <span>{roommateData.length}</span>
        </button>

        <button
          type="button"
          className={activeTab === "high" ? "active" : ""}
          onClick={() => setActiveTab("high")}
        >
          90%+ Match
        </button>

        <button
          type="button"
          className={activeTab === "new" ? "active" : ""}
          onClick={() => setActiveTab("new")}
        >
          New Matches
          <span>2</span>
        </button>
      </div>

      {/* Results */}
      <section className="matches-results">

        <div className="matches-results-header">
          <div>
            <h2>
              {activeTab === "high"
                ? "Highly compatible"
                : activeTab === "new"
                  ? "New matches"
                  : "All your matches"}
            </h2>

            <p>
              {matches.length} people match your preferences
            </p>
          </div>

          <button
            type="button"
            className="sort-matches"
          >
            Best Match ▾
          </button>
        </div>

        <div className="matches-grid">
          {matches.map((roommate) => (
            <MatchCard
              key={roommate.id}
              roommate={roommate}
            />
          ))}
        </div>

      </section>

    </div>
  );
}

export default Matches;