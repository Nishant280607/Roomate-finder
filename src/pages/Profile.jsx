import { useState } from "react";
import "./Profile.css";

function Profile() {
  const [editing, setEditing] = useState(false);

  const [profile, setProfile] = useState({
    name: "Alex Morgan",
    age: 24,
    location: "Brooklyn, New York",
    occupation: "Software Developer",
    bio: "Easy-going, clean and respectful person looking for a comfortable place with a friendly roommate. I enjoy coding, coffee, fitness and exploring new places.",
    budget: "$900 - $1,300",
    moveIn: "October 2026",
    cleanliness: "Very Clean",
    socialLevel: "Moderately Social",
    sleepSchedule: "Night Owl",
  });

  const [interests, setInterests] = useState([
    "Coding",
    "Coffee",
    "Gym",
    "Travel",
    "Movies",
    "Gaming",
  ]);

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleInterest(interest) {
    setInterests((previous) =>
      previous.includes(interest)
        ? previous.filter((item) => item !== interest)
        : [...previous, interest]
    );
  }

  function saveProfile() {
    setEditing(false);
  }

  const availableInterests = [
    "Coding",
    "Coffee",
    "Gym",
    "Travel",
    "Movies",
    "Gaming",
    "Cooking",
    "Music",
    "Reading",
    "Photography",
  ];

  return (
    <div className="profile-page">

      {/* Header */}
      <section className="profile-page-header">
        <div>
          <span className="profile-eyebrow">
            YOUR PERSONAL SPACE
          </span>

          <h1>My Profile</h1>

          <p>
            Tell potential roommates a little more about you.
          </p>
        </div>

        {!editing ? (
          <button
            type="button"
            className="edit-profile-button"
            onClick={() => setEditing(true)}
          >
            ✎ Edit Profile
          </button>
        ) : (
          <div className="profile-header-actions">
            <button
              type="button"
              className="cancel-profile-button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>

            <button
              type="button"
              className="save-profile-button"
              onClick={saveProfile}
            >
              Save Changes
            </button>
          </div>
        )}
      </section>

      {/* Main profile layout */}
      <div className="profile-layout">

        {/* Left column */}
        <aside className="profile-sidebar">

          <div className="profile-card profile-main-card">

            <div className="profile-photo-wrapper">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80"
                alt="Profile"
              />

              <span className="profile-online-dot"></span>

              {editing && (
                <button
                  type="button"
                  className="change-photo-button"
                >
                  📷
                </button>
              )}
            </div>

            {!editing ? (
              <>
                <h2>{profile.name}</h2>

                <p className="profile-role">
                  {profile.occupation}
                </p>

                <div className="profile-location">
                  <span>⌖</span>
                  {profile.location}
                </div>
              </>
            ) : (
              <div className="profile-edit-name">
                <input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />

                <input
                  name="occupation"
                  value={profile.occupation}
                  onChange={handleChange}
                  placeholder="Occupation"
                />
              </div>
            )}

            <div className="profile-match-score">
              <div className="match-score-circle">
                <strong>92%</strong>
              </div>

              <div>
                <strong>Great Match</strong>
                <span>Profile compatibility</span>
              </div>
            </div>

            <div className="profile-completion">
              <div className="completion-heading">
                <span>Profile completion</span>
                <strong>86%</strong>
              </div>

              <div className="completion-bar">
                <span></span>
              </div>

              <p>
                Complete your profile to get better matches.
              </p>
            </div>

          </div>

          {/* Quick stats */}
          <div className="profile-card quick-stats">

            <h3>Quick Details</h3>

            <div className="quick-detail">
              <span>🎂</span>
              <div>
                <small>Age</small>
                <strong>{profile.age} years old</strong>
              </div>
            </div>

            <div className="quick-detail">
              <span>💰</span>
              <div>
                <small>Monthly Budget</small>
                <strong>{profile.budget}</strong>
              </div>
            </div>

            <div className="quick-detail">
              <span>📦</span>
              <div>
                <small>Move-in</small>
                <strong>{profile.moveIn}</strong>
              </div>
            </div>

          </div>

        </aside>

        {/* Right column */}
        <main className="profile-content">

          {/* About */}
          <section className="profile-card profile-section">

            <div className="section-title">
              <div>
                <h2>About Me</h2>
                <p>Introduce yourself to potential roommates.</p>
              </div>

              <span>01</span>
            </div>

            {editing ? (
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                rows="5"
              />
            ) : (
              <p className="profile-bio">
                {profile.bio}
              </p>
            )}

          </section>

          {/* Lifestyle */}
          <section className="profile-card profile-section">

            <div className="section-title">
              <div>
                <h2>Lifestyle</h2>
                <p>
                  These preferences help us find compatible
                  roommates.
                </p>
              </div>

              <span>02</span>
            </div>

            <div className="lifestyle-grid">

              <div className="lifestyle-item">
                <span className="lifestyle-icon">🧹</span>

                <div>
                  <small>Cleanliness</small>

                  {editing ? (
                    <select
                      name="cleanliness"
                      value={profile.cleanliness}
                      onChange={handleChange}
                    >
                      <option>Very Clean</option>
                      <option>Clean</option>
                      <option>Relaxed</option>
                    </select>
                  ) : (
                    <strong>{profile.cleanliness}</strong>
                  )}
                </div>
              </div>

              <div className="lifestyle-item">
                <span className="lifestyle-icon">🗣️</span>

                <div>
                  <small>Social Level</small>

                  {editing ? (
                    <select
                      name="socialLevel"
                      value={profile.socialLevel}
                      onChange={handleChange}
                    >
                      <option>Very Social</option>
                      <option>Moderately Social</option>
                      <option>Quiet</option>
                    </select>
                  ) : (
                    <strong>{profile.socialLevel}</strong>
                  )}
                </div>
              </div>

              <div className="lifestyle-item">
                <span className="lifestyle-icon">🌙</span>

                <div>
                  <small>Sleep Schedule</small>

                  {editing ? (
                    <select
                      name="sleepSchedule"
                      value={profile.sleepSchedule}
                      onChange={handleChange}
                    >
                      <option>Early Bird</option>
                      <option>Normal</option>
                      <option>Night Owl</option>
                    </select>
                  ) : (
                    <strong>{profile.sleepSchedule}</strong>
                  )}
                </div>
              </div>

              <div className="lifestyle-item">
                <span className="lifestyle-icon">📍</span>

                <div>
                  <small>Preferred Location</small>

                  {editing ? (
                    <input
                      name="location"
                      value={profile.location}
                      onChange={handleChange}
                    />
                  ) : (
                    <strong>{profile.location}</strong>
                  )}
                </div>
              </div>

            </div>

          </section>

          {/* Budget */}
          <section className="profile-card profile-section">

            <div className="section-title">
              <div>
                <h2>Housing Preferences</h2>
                <p>Your ideal living situation.</p>
              </div>

              <span>03</span>
            </div>

            <div className="housing-grid">

              <div className="housing-item">
                <small>Monthly Budget</small>

                {editing ? (
                  <select
                    name="budget"
                    value={profile.budget}
                    onChange={handleChange}
                  >
                    <option>$600 - $900</option>
                    <option>$900 - $1,300</option>
                    <option>$1,300 - $1,700</option>
                    <option>$1,700+</option>
                  </select>
                ) : (
                  <strong>{profile.budget}</strong>
                )}
              </div>

              <div className="housing-item">
                <small>Move-in Date</small>

                {editing ? (
                  <input
                    name="moveIn"
                    value={profile.moveIn}
                    onChange={handleChange}
                  />
                ) : (
                  <strong>{profile.moveIn}</strong>
                )}
              </div>

              <div className="housing-item">
                <small>Preferred Room</small>

                <strong>Private Room</strong>
              </div>

              <div className="housing-item">
                <small>Apartment Type</small>

                <strong>Shared Apartment</strong>
              </div>

            </div>

          </section>

          {/* Interests */}
          <section className="profile-card profile-section">

            <div className="section-title">
              <div>
                <h2>Interests</h2>
                <p>
                  Shared interests can make living together easier.
                </p>
              </div>

              <span>04</span>
            </div>

            <div className="profile-interests">

              {availableInterests.map((interest) => (
                <button
                  type="button"
                  key={interest}
                  className={
                    interests.includes(interest)
                      ? "interest active"
                      : "interest"
                  }
                  onClick={() => {
                    if (editing) {
                      toggleInterest(interest);
                    }
                  }}
                >
                  {interests.includes(interest) && "✓ "}
                  {interest}
                </button>
              ))}

            </div>

          </section>

        </main>
      </div>
    </div>
  );
}

export default Profile;