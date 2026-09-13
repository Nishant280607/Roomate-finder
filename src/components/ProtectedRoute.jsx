import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-main, #F8F7FF)",
        gap: "16px"
      }}>
        <div style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #7048E8, #9B72FA)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "24px",
          fontWeight: "800",
          boxShadow: "0 8px 24px rgba(112, 72, 232, 0.35)",
          animation: "pulseGlow 2s infinite"
        }}>
          R
        </div>
        <p style={{
          fontSize: "15px",
          fontWeight: "600",
          color: "var(--muted, #77748A)",
          letterSpacing: "-0.01em"
        }}>
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;