// src/components/NavBar.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/FireBaseConfig";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import "./NavBar.css";

const NavBar = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  const isActive = (path) => location.pathname === path;

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark");
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) document.body.classList.add("dark");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const closeMenu = () => setMenuOpen(false);

  const homePath = role === "student" ? "/student-home" : "/client-home";

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link className="logo" to={homePath} onClick={closeMenu}>
        <div className="logo-icon">🏫</div>
        <span className="logo-text">Campus<span className="logo-highlight">Hub</span></span>
      </Link>

      {/* Hamburger button */}
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      {/* Navigation links + mobile actions */}
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {/* Standard links */}
        <Link className={isActive(homePath) ? "active" : ""} to={homePath} onClick={closeMenu}>
          Home
        </Link>

        {role === "student" && (
          <>
            <Link className={isActive("/jobs") ? "active" : ""} to="/jobs" onClick={closeMenu}>
              Browse Jobs
            </Link>
            <Link className={isActive("/my-bids") ? "active" : ""} to="/my-bids" onClick={closeMenu}>
              My Bids
            </Link>
            <Link className={isActive("/student-dashboard") ? "active" : ""} to="/student-dashboard" onClick={closeMenu}>
              Dashboard
            </Link>
            <Link className={isActive("/earnings") ? "active" : ""} to="/earnings" onClick={closeMenu}>
              Earnings
            </Link>
          </>
        )}

        {role === "client" && (
          <>
            <Link className={isActive("/client-dashboard") ? "active" : ""} to="/client-dashboard" onClick={closeMenu}>
              Dashboard
            </Link>
            <Link className={isActive("/post-job") ? "active" : ""} to="/post-job" onClick={closeMenu}>
              Post Job
            </Link>
            <Link className={isActive("/all-bids") ? "active" : ""} to="/all-bids" onClick={closeMenu}>
              View Bids
            </Link>
          </>
        )}

        <Link className={isActive("/profile") ? "active" : ""} to="/profile" onClick={closeMenu}>
          Profile
        </Link>

        {/* 🔽 Mobile‑only actions (inside hamburger) */}
        <div className="mobile-actions">
          <div className="bell" onClick={() => { alert("Notifications coming soon!"); closeMenu(); }}>
            🔔
          </div>
          <div className="dark-toggle" onClick={() => { toggleDarkMode(); closeMenu(); }}>
            {darkMode ? "☀️" : "🌙"}
          </div>
          {user && (
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="profile"
              className="profile-img"
              onClick={() => { navigate("/profile"); closeMenu(); }}
            />
          )}
          {user && (
            <button className="logout-btn" onClick={() => { handleLogout(); closeMenu(); }}>
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Desktop‑only actions (hidden on mobile) */}
      <div className="nav-actions desktop-actions">
        <div className="bell" onClick={() => alert("Notifications coming soon!")}>🔔</div>
        <div className="dark-toggle" onClick={toggleDarkMode}>{darkMode ? "☀️" : "🌙"}</div>
        {user && (
          <img
            src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
            alt="profile"
            className="profile-img"
            onClick={() => navigate("/profile")}
          />
        )}
        {user && <button className="logout-btn" onClick={handleLogout}>Logout</button>}
      </div>
    </nav>
  );
};

export default NavBar;