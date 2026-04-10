// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();

  // 🔄 Show loading indicator while auth state is being determined
  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // 🚪 Not logged in → redirect to sign in
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  // 🎭 Role‑based access control
  if (allowedRole && role !== allowedRole) {
    // Redirect to the appropriate dashboard for the actual role
    const destination = role === "student" ? "/student-dashboard" : "/client-dashboard";
    return <Navigate to={destination} replace />;
  }

  // ✅ All checks passed – render the protected page
  return children;
};

export default ProtectedRoute;