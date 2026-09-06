import "./NotificationCard.css";

function NotificationCard({ notification, onRead }) {
  if (!notification) return null;
  const isRead = notification.read ?? notification.is_read ?? false;

  return (
    <div className={`notification-card ${isRead ? "read" : "unread"}`}>
      <div className={`notification-card-icon ${notification.type || "system"}`}>
        {notification.icon || (notification.type === "match" ? "✦" : notification.type === "message" ? "💬" : "✓")}
      </div>

      <div className="notification-card-info">
        <div className="notification-card-title-row">
          <h3>{notification.title}</h3>
          {!isRead && <span className="notification-unread-dot"></span>}
        </div>

        <p>{notification.message || notification.text}</p>

        <span className="notification-card-time">{notification.time}</span>
      </div>

      {!isRead && onRead && (
        <button
          type="button"
          className="btn-mark-read"
          onClick={() => onRead(notification.id)}
        >
          Mark read
        </button>
      )}
    </div>
  );
}

export default NotificationCard;