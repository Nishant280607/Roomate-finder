import { useState } from "react";
import "./Notifications.css";

const initialNotifications = [
  {
    id: 1,
    type: "match",
    title: "New match found",
    text: "You and Sarah Johnson have a 94% compatibility score.",
    time: "5 minutes ago",
    unread: true,
    icon: "✦",
  },
  {
    id: 2,
    type: "message",
    title: "New message",
    text: "David Wilson sent you a message.",
    time: "24 minutes ago",
    unread: true,
    icon: "💬",
  },
  {
    id: 3,
    type: "profile",
    title: "Profile viewed",
    text: "Emma Davis viewed your profile.",
    time: "2 hours ago",
    unread: true,
    icon: "◉",
  },
  {
    id: 4,
    type: "system",
    title: "Complete your profile",
    text: "Add more preferences to improve your matches.",
    time: "Yesterday",
    unread: false,
    icon: "✓",
  },
  {
    id: 5,
    type: "match",
    title: "Another great match",
    text: "Michael Brown matches 89% of your preferences.",
    time: "Yesterday",
    unread: false,
    icon: "✦",
  },
];

function Notifications() {
  const [notifications, setNotifications] =
    useState(initialNotifications);

  function markAllRead() {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        unread: false,
      }))
    );
  }

  function markRead(id) {
    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? { ...notification, unread: false }
          : notification
      )
    );
  }

  const unreadCount = notifications.filter(
    (notification) => notification.unread
  ).length;

  return (
    <div className="notifications-page">
      <section className="notifications-header">
        <div>
          <span className="notifications-eyebrow">
            KEEP UP TO DATE
          </span>

          <h1>Notifications</h1>

          <p>
            See what's happening with your RoomieFinder account.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="mark-all-button"
            onClick={markAllRead}
          >
            Mark all as read
          </button>
        )}
      </section>

      <section className="notifications-card">
        <div className="notifications-card-header">
          <div>
            <h2>Recent activity</h2>
            <p>{unreadCount} unread notifications</p>
          </div>

          <span className="notification-total">
            {notifications.length}
          </span>
        </div>

        <div className="notification-list">
          {notifications.map((notification) => (
            <button
              type="button"
              key={notification.id}
              className={`notification-item ${
                notification.unread ? "unread" : ""
              }`}
              onClick={() => markRead(notification.id)}
            >
              <div className={`notification-icon ${notification.type}`}>
                {notification.icon}
              </div>

              <div className="notification-content">
                <div className="notification-title-row">
                  <strong>{notification.title}</strong>
                  <span>{notification.time}</span>
                </div>

                <p>{notification.text}</p>
              </div>

              {notification.unread && (
                <span className="notification-dot"></span>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Notifications;