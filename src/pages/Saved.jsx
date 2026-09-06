import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { savedService } from "../services/savedService";
import RoommateCard from "../components/RoommateCard";
import RoommateModal from "../components/RoommateModal";
import "./saved.css";

function Saved() {
  const { user } = useAuth();
  const [savedPeople, setSavedPeople] = useState([]);
  const [selectedRoommate, setSelectedRoommate] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await savedService.getSaved(user?.id);
      setSavedPeople(data);
    }
    load();
  }, [user]);

  async function handleToggleSave(roommate) {
    const res = await savedService.toggleSave(user?.id, roommate);
    setSavedPeople(res.list);
  }

  return (
    <div className="saved-page animate-fade-up">
      {/* Header */}
      <section className="saved-header-card">
        <div>
          <span className="saved-eyebrow">YOUR SHORTLIST</span>
          <h1>Saved Roommates</h1>
          <p>Keep track of potential roommates and reach out when you're ready.</p>
        </div>

        <div className="saved-count-pill">
          <strong>{savedPeople.length}</strong>
          <span>Saved</span>
        </div>
      </section>

      {/* Grid or Empty State */}
      {savedPeople.length > 0 ? (
        <section className="saved-cards-grid">
          {savedPeople.map((roommate) => (
            <RoommateCard
              key={roommate.id}
              roommate={roommate}
              isSaved={true}
              onToggleSave={handleToggleSave}
              onViewProfile={(r) => setSelectedRoommate(r)}
            />
          ))}
        </section>
      ) : (
        <div className="saved-empty-box">
          <div className="empty-bookmark-icon">☆</div>
          <h2>No saved roommates yet</h2>
          <p>
            When you discover someone whose lifestyle matches yours, click the heart or save icon to keep them here.
          </p>
          <Link to="/discover" className="btn-empty-discover">
            Discover Roommates →
          </Link>
        </div>
      )}

      {selectedRoommate && (
        <RoommateModal
          roommate={selectedRoommate}
          isSaved={true}
          onToggleSave={handleToggleSave}
          onClose={() => setSelectedRoommate(null)}
        />
      )}
    </div>
  );
}

export default Saved;