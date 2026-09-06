import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

    if (!formData.email || !formData.password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      await login(formData.email.trim(), formData.password);
      const destination = location.state?.from?.pathname || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      console.warn("Login failed:", err);
      if (err.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again or create an account.");
      } else {
        setError(err.message || "Failed to sign in. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
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

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email address</label>
            <div className="input-wrapper">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="alex@example.com"
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
                placeholder="••••••••"
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

          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="forgot-password"
              onClick={() => setError("Enter your registered email and we will send reset instructions.")}
            >
              Forgot password?
            </button>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Sign In →"}
          </button>

          <div className="demo-account-box">
            <p>Looking to explore the platform?</p>
            <button
              type="button"
              className="btn-demo-fill"
              onClick={() => {
                setFormData({
                  email: "demo.roomie@example.com",
                  password: "Password123!",
                });
              }}
            >
              Pre-fill Demo Credentials
            </button>
          </div>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <button
          className="google-button"
          type="button"
          onClick={() => setError("Google OAuth can be enabled directly in your Supabase Auth provider settings.")}
        >
          <span className="google-icon">G</span>
          Continue with Google
        </button>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create an account</Link>
        </p>

        <p className="auth-terms">
          By signing in, you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}

export default Login;