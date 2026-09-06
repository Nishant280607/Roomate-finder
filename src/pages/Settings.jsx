import { useState } from "react";
import "./settings.css";

function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    matchNotifications: true,
    messageNotifications: true,
    profileVisibility: true,
    showOnlineStatus: true,
  });

  const [saved, setSaved] = useState(false);

  function toggleSetting(name) {
    setSettings((previous) => ({
      ...previous,
      [name]: !previous[name],
    }));

    setSaved(false);
  }

  function saveSettings() {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  }

  return (
    <div className="settings-page">
      <section className="settings-header">
        <div>
          <span className="settings-eyebrow">
            PERSONALIZE YOUR EXPERIENCE
          </span>

          <h1>Settings</h1>

          <p>
            Manage your account, privacy and notification
            preferences.
          </p>
        </div>
      </section>

      <div className="settings-layout">

        {/* Account */}
        <section className="settings-card">
          <div className="settings-section-heading">
            <div className="settings-section-icon">◎</div>

            <div>
              <h2>Account</h2>
              <p>Manage your basic account information.</p>
            </div>
          </div>

          <div className="settings-form">
            <label>
              Email Address
              <input
                type="email"
                value="alex@example.com"
                readOnly
              />
            </label>

            <label>
              Phone Number
              <input
                type="tel"
                value="+1 555 123 4567"
                readOnly
              />
            </label>
          </div>

          <button type="button" className="secondary-settings-button">
            Change Password
          </button>
        </section>

        {/* Notifications */}
        <section className="settings-card">
          <div className="settings-section-heading">
            <div className="settings-section-icon">◌</div>

            <div>
              <h2>Notifications</h2>
              <p>Choose what you want to be notified about.</p>
            </div>
          </div>

          <SettingToggle
            title="Email notifications"
            description="Receive important updates by email."
            enabled={settings.emailNotifications}
            onClick={() =>
              toggleSetting("emailNotifications")
            }
          />

          <SettingToggle
            title="New match notifications"
            description="Get notified when you receive a new match."
            enabled={settings.matchNotifications}
            onClick={() =>
              toggleSetting("matchNotifications")
            }
          />

          <SettingToggle
            title="Message notifications"
            description="Get notified when someone sends you a message."
            enabled={settings.messageNotifications}
            onClick={() =>
              toggleSetting("messageNotifications")
            }
          />
        </section>

        {/* Privacy */}
        <section className="settings-card">
          <div className="settings-section-heading">
            <div className="settings-section-icon">◈</div>

            <div>
              <h2>Privacy</h2>
              <p>Control who can see and interact with you.</p>
            </div>
          </div>

          <SettingToggle
            title="Profile visibility"
            description="Allow other users to discover your profile."
            enabled={settings.profileVisibility}
            onClick={() =>
              toggleSetting("profileVisibility")
            }
          />

          <SettingToggle
            title="Show online status"
            description="Let matches know when you're online."
            enabled={settings.showOnlineStatus}
            onClick={() =>
              toggleSetting("showOnlineStatus")
            }
          />
        </section>

        {/* Danger zone */}
        <section className="settings-card danger-card">
          <div className="settings-section-heading">
            <div className="settings-section-icon danger-icon">
              !
            </div>

            <div>
              <h2>Danger Zone</h2>
              <p>Actions that affect your account.</p>
            </div>
          </div>

          <button type="button" className="delete-account-button">
            Delete Account
          </button>
        </section>

      </div>

      <div className="settings-save-area">
        {saved && (
          <span className="settings-saved">
            ✓ Settings saved
          </span>
        )}

        <button
          type="button"
          className="settings-save-button"
          onClick={saveSettings}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  enabled,
  onClick,
}) {
  return (
    <div className="setting-toggle-row">
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>

      <button
        type="button"
        className={`toggle ${enabled ? "enabled" : ""}`}
        onClick={onClick}
        aria-label={title}
      >
        <span></span>
      </button>
    </div>
  );
}

export default Settings;
