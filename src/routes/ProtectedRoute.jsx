// src/routes/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (!user) return <Navigate to="/signin" replace />;
  if (allowedRole && role !== allowedRole) {
    // Redirect to the correct dashboard based on actual role
    const destination = role === "student" ? "/student-home" : "/client-home";
    return <Navigate to={destination} replace />;
  }
  return children;
};

export default ProtectedRoute;