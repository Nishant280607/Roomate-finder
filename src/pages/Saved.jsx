import { useState } from "react";
import { roommateData } from "../data/mockData";
import RoommateCard from "../components/RoommateCard";
import "./Saved.css";

function Saved() {
  const [savedPeople, setSavedPeople] = useState(roommateData);

  function removeSaved(id) {
    setSavedPeople((previous) =>
      previous.filter((person) => person.id !== id)
    );
  }

  return (
    <div className="saved-page">
      <section className="saved-header">
        <div>
          <span className="saved-eyebrow">YOUR SHORTLIST</span>
          <h1>Saved Roommates</h1>
          <p>
            Keep track of people you may want to connect with.
          </p>
        </div>

        <div className="saved-count">
          <strong>{savedPeople.length}</strong>
          <span>saved</span>
        </div>
      </section>

      {savedPeople.length > 0 ? (
        <section>
          <div className="saved-results-heading">
            <div>
              <h2>Your saved people</h2>
              <p>People you've bookmarked for later.</p>
            </div>
          </div>

          <div className="saved-grid">
            {savedPeople.map((roommate) => (
              <div className="saved-card-wrapper" key={roommate.id}>
                <RoommateCard roommate={roommate} />

                <button
                  type="button"
                  className="remove-saved"
                  onClick={() => removeSaved(roommate.id)}
                >
                  Remove from saved
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="saved-empty">
          <div>♡</div>
          <h2>No saved roommates</h2>
          <p>
            When you find someone interesting, save them here.
          </p>
        </div>
      )}
    </div>
  );
}

export default Saved;