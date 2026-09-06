import { roommateData, dashboardStats } from "../data/mockData";
import StatCard from "../components/StatCard";
import RoommateCard from "../components/RoommateCard";
import "./Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard">

      {/* Header */}
      <section className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            YOUR DASHBOARD
          </span>

          <h1>
            Good morning, Alex <span>👋</span>
          </h1>

          <p>
            Find someone who matches your lifestyle, preferences,
            and personality.
          </p>
        </div>

        <button className="dashboard-action" type="button">
          + Complete Profile
        </button>
      </section>

      {/* Statistics */}
      <section className="stats-grid">
        {dashboardStats.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </section>

      {/* Recommendations */}
      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <span className="section-eyebrow">
              PERSONALIZED FOR YOU
            </span>

            <h2>Recommended Roommates</h2>

            <p>
              People who have a high compatibility with your lifestyle.
            </p>
          </div>

          <button className="view-all-button" type="button">
            View all →
          </button>
        </div>

        <div className="roommate-grid">
          {roommateData.slice(0, 3).map((roommate) => (
            <RoommateCard
              key={roommate.id}
              roommate={roommate}
            />
          ))}
        </div>

      </section>

      {/* Bottom section */}
      <section className="dashboard-bottom-grid">

        <div className="activity-card">
          <div className="card-heading">
            <div>
              <span className="section-eyebrow">
                RECENT ACTIVITY
              </span>

              <h2>What's happening</h2>
            </div>

            <span className="activity-count">4</span>
          </div>

          <div className="activity-list">

            <div className="activity-item">
              <div className="activity-icon match">
                ♡
              </div>

              <div>
                <strong>New match!</strong>
                <p>Sarah matched with you</p>
              </div>

              <span>2m</span>
            </div>

            <div className="activity-item">
              <div className="activity-icon message">
                ◌
              </div>

              <div>
                <strong>New message</strong>
                <p>David sent you a message</p>
              </div>

              <span>18m</span>
            </div>

            <div className="activity-item">
              <div className="activity-icon profile">
                ◉
              </div>

              <div>
                <strong>Profile viewed</strong>
                <p>Someone viewed your profile</p>
              </div>

              <span>1h</span>
            </div>

          </div>
        </div>

        <div className="profile-progress-card">
          <div className="progress-top">
            <div>
              <span className="section-eyebrow">
                PROFILE STRENGTH
              </span>

              <h2>Almost there!</h2>
            </div>

            <div className="progress-percentage">
              78%
            </div>
          </div>

          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>

          <p>
            Complete your profile to get more accurate roommate
            recommendations.
          </p>

          <button type="button">
            Complete profile →
          </button>
        </div>

      </section>

    </div>
  );
}

export default Dashboard;