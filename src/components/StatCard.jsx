import "./StatCard.css";

function StatCard({ title, value, description, icon, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-icon-wrapper">{icon}</div>
        <span className={`stat-trend-badge ${trend || "positive"}`}>
          {trend === "positive" ? "↗" : "•"} {description}
        </span>
      </div>

      <div className="stat-value-area">
        <h3 className="stat-value">{value}</h3>
        <span className="stat-title">{title}</span>
      </div>
    </div>
  );
}

export default StatCard;