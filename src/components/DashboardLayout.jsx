
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/FireBaseConfig";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  return (
    <div className="dashboard">
      {/* 🔥 Sidebar */}
      <div className="sidebar">
        <h3 className="logo">🚀 Hub</h3>

        <Link to="/home">🏠 Home</Link>
        <Link to="/jobs">💼 Jobs</Link>
        <Link to="/mybids">📄 My Bids</Link>

        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>

      {/* 🔥 Main Content */}
      <div className="main-content">
        {/* Top Navbar */}
        <div className="topbar">
          <h4>Dashboard</h4>
        </div>

        {/* Page Content */}
        <div className="content">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;

