import { useNavigate } from "react-router-dom";
import "./RoommateCard.css";

function RoommateCard({ roommate, isSaved, onToggleSave, onViewProfile }) {
  const navigate = useNavigate();
  if (!roommate) return null;

  return (
    <article className="roommate-card">
      <div className="roommate-image-wrapper">
        <img
          src={roommate.image}
          alt={roommate.name}
          className="roommate-image"
        />

        <div className="compatibility-badge">
          <span>✦</span> {roommate.compatibility}% Match
        </div>

        <button
          className={`save-button ${isSaved ? "saved" : ""}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave && onToggleSave(roommate);
          }}
          aria-label="Save profile"
        >
          {isSaved ? "♥" : "♡"}
        </button>
      </div>

      <div className="roommate-content">
        <div className="roommate-name-row">
          <div>
            <h3>{roommate.name}</h3>
            <span>{roommate.age} years old</span>
          </div>
          <span className="online-dot" title="Available now"></span>
        </div>

        <div className="roommate-location">
          <span>📍</span> {roommate.location}
        </div>

        <p className="roommate-occupation">{roommate.occupation}</p>

        <div className="roommate-tags">
          {roommate.interests && roommate.interests.slice(0, 3).map((interest) => (
            <span key={interest}>{interest}</span>
          ))}
        </div>

        <div className="roommate-footer">
          <span className="lifestyle-tag">{roommate.lifestyle}</span>

          <div className="card-btn-group">
            <button
              className="btn-card-msg"
              type="button"
              onClick={() => navigate(`/messages?user=${roommate.id}`)}
              title="Message"
            >
              💬
            </button>
            <button
              className="view-profile-button"
              type="button"
              onClick={() => onViewProfile && onViewProfile(roommate)}
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default RoommateCard;