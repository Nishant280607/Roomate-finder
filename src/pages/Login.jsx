import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmHelp, setShowConfirmHelp] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setShowConfirmHelp(false);

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      await login(formData.email.trim(), formData.password);
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      console.warn("Login failed:", err);
      const msg = err.message || "";
      if (msg.toLowerCase().includes("email not confirmed")) {
        setShowConfirmHelp(true);
        setError("Email not confirmed yet by Supabase. You can bypass this with Demo Sign In below, or disable 'Confirm email' in Supabase Auth settings.");
      } else if (msg.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please check your credentials or create a new account.");
      } else {
        setError(msg || "Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function handleInstantDemo() {
    loginAsDemo();
    navigate("/dashboard");
  }

  return (
    <div className="auth-page">
      <Link to="/" className="auth-brand">
        <div className="auth-logo">R</div>
        <span>RoomieFinder</span>
      </Link>

      <div className="auth-card">
        <div className="auth-badge">WELCOME BACK</div>
        <h1>Sign In</h1>
        <p className="auth-subtitle">
          Log in to continue finding your ideal roommate and living space.
        </p>

        {/* Instant Demo Sign-In Banner */}
        <div style={{
          background: "linear-gradient(135deg, #F0EBFF, #E5DBFF)",
          border: "1px solid #C4B5FD",
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px"
        }}>
          <div>
            <strong style={{ display: "block", fontSize: "0.88rem", color: "#5F3DC4" }}>
              ⚡ Instant Recruiter / Demo Access
            </strong>
            <small style={{ fontSize: "0.78rem", color: "#77748A" }}>
              Skip email verification and explore the app immediately
            </small>
          </div>
          <button
            type="button"
            onClick={handleInstantDemo}
            style={{
              background: "#7048E8",
              color: "#FFFFFF",
              fontWeight: "700",
              fontSize: "0.82rem",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(112, 72, 232, 0.3)"
            }}
          >
            Demo Sign In →
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-error" style={{ lineHeight: "1.4" }}>
              {error}
              {showConfirmHelp && (
                <div style={{ marginTop: "10px" }}>
                  <button
                    type="button"
                    onClick={handleInstantDemo}
                    style={{
                      background: "#059669",
                      color: "#FFFFFF",
                      fontWeight: "700",
                      fontSize: "0.82rem",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "none",
                      cursor: "pointer",
                      width: "100%"
                    }}
                  >
                    Click Here: Continue with Demo Account Instead
                  </button>
                </div>
              )}
            </div>
          )}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Sign In →"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;