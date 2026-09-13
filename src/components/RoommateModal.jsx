import { useNavigate } from "react-router-dom";
import "./RoommateModal.css";

function RoommateModal({ roommate, isSaved, onToggleSave, onClose }) {
  const navigate = useNavigate();
  if (!roommate) return null;

  function handleMessage() {
    onClose();
    navigate(`/messages?user=${roommate.id}`);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="roommate-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close profile modal"
        >
          ✕
        </button>

        <div className="modal-header">
          <div className="modal-cover-gradient"></div>
          <div className="modal-profile-top">
            <img
              src={roommate.image}
              alt={roommate.name}
              className="modal-avatar"
            />
            <div className="modal-match-badge">
              <span>✦</span> {roommate.compatibility}% Match
            </div>
          </div>

          <div className="modal-heading">
            <div className="modal-title-row">
              <h2>{roommate.name}, {roommate.age}</h2>
              <button
                type="button"
                className={`modal-save-btn ${isSaved ? "saved" : ""}`}
                onClick={() => onToggleSave && onToggleSave(roommate)}
              >
                {isSaved ? "♥ Saved" : "♡ Save"}
              </button>
            </div>
            <p className="modal-occupation">{roommate.occupation}</p>
            <p className="modal-location">📍 {roommate.location}</p>
          </div>
        </div>

        <div className="modal-body">
          {/* About */}
          <div className="modal-section">
            <h3>About Me</h3>
            <p className="modal-bio">
              {roommate.bio || "Friendly and clean roommate looking for a positive living arrangement in a great neighborhood."}
            </p>
          </div>

          {/* Quick Details Grid */}
          <div className="modal-details-grid">
            <div className="detail-item">
              <span className="detail-icon">💰</span>
              <div>
                <small>Monthly Budget</small>
                <strong>{roommate.budget || "$1,000 - $1,400"}</strong>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">📦</span>
              <div>
                <small>Move-in Timeline</small>
                <strong>{roommate.moveIn || "Flexible"}</strong>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">🧹</span>
              <div>
                <small>Cleanliness</small>
                <strong>{roommate.cleanliness || roommate.lifestyle || "Very Clean"}</strong>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-icon">🌙</span>
              <div>
                <small>Sleep Schedule</small>
                <strong>{roommate.sleepSchedule || "Normal"}</strong>
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="modal-section">
            <h3>Interests & Lifestyle</h3>
            <div className="modal-tags">
              {roommate.interests && roommate.interests.map((interest) => (
                <span key={interest} className="modal-tag">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-modal-message"
            onClick={handleMessage}
          >
            💬 Send Message
          </button>
          <button
            type="button"
            className="btn-modal-close"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoommateModal;