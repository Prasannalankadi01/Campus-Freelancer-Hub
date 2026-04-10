// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./App.css";
import NavBar from "./components/NavBar";

// Pages
import About from "./pages/About";               // ✅ import About page
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Jobs from "./pages/Jobs";
import MyBids from "./pages/MyBids";
import JobBids from "./pages/JobBids";
import StudentDashboard from "./pages/StudentDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import Projects from "./pages/Projects";
import Earnings from "./pages/Earnings";
import PostJob from "./pages/PostJob";
import Profile from "./pages/Profile";
import StudentBidPage from "./pages/StudentBidPage";
import AllBids from "./pages/AllBids";
import StudentHome from "./pages/StudentHome";
import ClientHome from "./pages/ClientHome";
import PageNotFound from "./pages/PageNotFound";

// Auth
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  const { user, role, loading } = useAuth();

  // ⏳ Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Navbar - only shown when user is logged in */}
      {user && <NavBar />}

      <Routes>
        {/* 🌟 Public Routes – About page is the first landing */}
        <Route path="/" element={<About />} />   {/* ✅ About page as root */}
        <Route
          path="/signup"
          element={!user ? <SignUp /> : <Navigate to={role === "client" ? "/client-home" : "/student-home"} replace />}
        />
        <Route
          path="/signin"
          element={!user ? <SignIn /> : <Navigate to={role === "client" ? "/client-home" : "/student-home"} replace />}
        />

        {/* 🔒 Protected Routes (authenticated only) */}
        {/* Common */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />

        {/* Student only */}
        <Route path="/student-home" element={<ProtectedRoute allowedRole="student"><StudentHome /></ProtectedRoute>} />
        <Route path="/student-dashboard" element={<ProtectedRoute allowedRole="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute allowedRole="student"><Jobs /></ProtectedRoute>} />
        <Route path="/student-bid/:jobId" element={<ProtectedRoute allowedRole="student"><StudentBidPage /></ProtectedRoute>} />
        <Route path="/my-bids" element={<ProtectedRoute allowedRole="student"><MyBids /></ProtectedRoute>} />
        <Route path="/earnings" element={<ProtectedRoute allowedRole="student"><Earnings /></ProtectedRoute>} />

        {/* Client only */}
        <Route path="/client-home" element={<ProtectedRoute allowedRole="client"><ClientHome /></ProtectedRoute>} />
        <Route path="/client-dashboard" element={<ProtectedRoute allowedRole="client"><ClientDashboard /></ProtectedRoute>} />
        <Route path="/post-job" element={<ProtectedRoute allowedRole="client"><PostJob /></ProtectedRoute>} />
        <Route path="/job-bids/:jobId" element={<ProtectedRoute allowedRole="client"><JobBids /></ProtectedRoute>} />
        <Route path="/all-bids" element={<ProtectedRoute allowedRole="client"><AllBids /></ProtectedRoute>} />

        {/* ❌ Fallback 404 – must be last */}
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;