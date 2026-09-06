import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MatchCard.css";

function MatchCard({ roommate, isSaved, onToggleSave, onViewProfile }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(true);

  if (!roommate) return null;

  function handleMessageClick() {
    navigate(`/messages?user=${roommate.id}`);
  }

  return (
    <article className="match-card">
      <div className="match-card-image-wrapper">
        <img
          src={roommate.image}
          alt={roommate.name}
          className="match-card-image"
        />

        <div className="match-score-pill">
          <span className="match-sparkle">✦</span>
          {roommate.compatibility}% Match
        </div>

        <div className="match-status-badge">
          <span className="status-dot"></span>
          Matched
        </div>

        <button
          className={`match-save-btn ${isSaved ? "saved" : ""}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave && onToggleSave(roommate);
          }}
          aria-label="Save roommate"
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>

      <div className="match-card-content">
        <div className="match-card-heading">
          <div>
            <h3>{roommate.name}, {roommate.age}</h3>
            <p className="match-location">📍 {roommate.location}</p>
          </div>

          <button
            className={`match-like-btn ${liked ? "liked" : ""}`}
            type="button"
            onClick={() => setLiked(!liked)}
            aria-label="Like match"
          >
            {liked ? "♥" : "♡"}
          </button>
        </div>

        <div className="match-details-row">
          <div className="match-detail-tag">
            <span className="detail-icon">💼</span>
            <div className="detail-text">
              <small>Occupation</small>
              <strong>{roommate.occupation}</strong>
            </div>
          </div>

          <div className="match-detail-tag">
            <span className="detail-icon">✨</span>
            <div className="detail-text">
              <small>Lifestyle</small>
              <strong>{roommate.lifestyle}</strong>
            </div>
          </div>
        </div>

        <div className="shared-interests-section">
          <span className="shared-label">Interests</span>
          <div className="interest-chips">
            {roommate.interests && roommate.interests.slice(0, 4).map((interest) => (
              <span key={interest} className="interest-chip">
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="match-actions">
          <button
            className="btn-match-message"
            type="button"
            onClick={handleMessageClick}
          >
            💬 Message
          </button>

          <button
            className="btn-match-profile"
            type="button"
            onClick={() => onViewProfile && onViewProfile(roommate)}
          >
            View Profile →
          </button>
        </div>
      </div>
    </article>
  );
}

export default MatchCard;