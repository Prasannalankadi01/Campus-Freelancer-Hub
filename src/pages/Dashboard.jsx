// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { db } from "../firebase/FireBaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalBids: 0,
    activeBids: 0,
    completedProjects: 0,
    totalEarnings: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        if (role === "student") {
          // Fetch student stats
          const bidsQuery = query(
            collection(db, "bids"),
            where("userEmail", "==", user.email)
          );
          const bidsSnapshot = await getDocs(bidsQuery);
          const bids = bidsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          const acceptedBids = bids.filter(bid => bid.status === "accepted");
          const pendingBids = bids.filter(bid => bid.status === "pending");
          
          setStats({
            totalJobs: 0,
            totalBids: bids.length,
            activeBids: pendingBids.length,
            completedProjects: acceptedBids.length,
            totalEarnings: acceptedBids.reduce((sum, bid) => sum + (bid.bidAmount || 0), 0)
          });
          
          setRecentActivity(bids.slice(0, 5));
          
        } else if (role === "client") {
          // Fetch client stats
          const jobsQuery = query(
            collection(db, "jobs"),
            where("createdBy", "==", user.uid)
          );
          const jobsSnapshot = await getDocs(jobsQuery);
          const jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          setStats({
            totalJobs: jobs.length,
            totalBids: 0,
            activeBids: jobs.filter(job => job.status === "open").length,
            completedProjects: jobs.filter(job => job.status === "completed").length,
            totalEarnings: 0
          });
          
          setRecentActivity(jobs.slice(0, 5));
        }
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, role]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-main">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-main">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h2>Welcome back, {user?.displayName || user?.email?.split('@')[0]}! 👋</h2>
          <p>Here's what's happening with your freelance journey today.</p>
        </div>
        
        {/* Stats Cards */}
        <div className="cards-container">
          {role === "student" ? (
            <>
              <div className="home-card">
                <h4>📊 TOTAL BIDS</h4>
                <h2>{stats.totalBids}</h2>
              </div>
              
              <div className="home-card">
                <h4>⏳ ACTIVE BIDS</h4>
                <h2>{stats.activeBids}</h2>
              </div>
              
              <div className="home-card">
                <h4>✅ COMPLETED</h4>
                <h2>{stats.completedProjects}</h2>
              </div>
              
              <div className="home-card">
                <h4>💰 TOTAL EARNINGS</h4>
                <h2>₹{stats.totalEarnings}</h2>
              </div>
            </>
          ) : (
            <>
              <div className="home-card">
                <h4>📋 TOTAL JOBS</h4>
                <h2>{stats.totalJobs}</h2>
              </div>
              
              <div className="home-card">
                <h4>🟢 ACTIVE JOBS</h4>
                <h2>{stats.activeBids}</h2>
              </div>
              
              <div className="home-card">
                <h4>✅ COMPLETED</h4>
                <h2>{stats.completedProjects}</h2>
              </div>
              
              <div className="home-card">
                <h4>👥 TOTAL APPLICANTS</h4>
                <h2>—</h2>
              </div>
            </>
          )}
        </div>
        
        {/* Recent Activity Section */}
        <div className="recent-activity-section">
          <h3>📋 Recent Activity</h3>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <div className="home-card">
                <p>No recent activity to show.</p>
                {role === "student" ? (
                  <button onClick={() => navigate("/jobs")} className="action-btn">
                    Browse Jobs →
                  </button>
                ) : (
                  <button onClick={() => navigate("/post-job")} className="action-btn">
                    Post a Job →
                  </button>
                )}
              </div>
            ) : (
              recentActivity.map((item, index) => (
                <div key={item.id} className="activity-item home-card">
                  {role === "student" ? (
                    <>
                      <div className="activity-icon">
                        {item.status === "accepted" ? "✅" : item.status === "rejected" ? "❌" : "⏳"}
                      </div>
                      <div className="activity-details">
                        <h4>{item.jobTitle}</h4>
                        <p>Bid: ₹{item.bidAmount} • Status: {item.status || "pending"}</p>
                        <small>
                          {item.createdAt?.toDate 
                            ? new Date(item.createdAt.toDate()).toLocaleDateString() 
                            : "Recently"}
                        </small>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="activity-icon">💼</div>
                      <div className="activity-details">
                        <h4>{item.title}</h4>
                        <p>Budget: ₹{item.price} • Status: {item.status || "open"}</p>
                        <small>
                          {item.createdAt?.toDate 
                            ? new Date(item.createdAt.toDate()).toLocaleDateString() 
                            : "Recently"}
                        </small>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h3>⚡ Quick Actions</h3>
          <div className="cards-container">
            {role === "student" ? (
              <>
                <div className="home-card" onClick={() => navigate("/jobs")}>
                  <h5>🔍 Find Jobs</h5>
                  <p>Browse available freelance opportunities</p>
                </div>
                <div className="home-card" onClick={() => navigate("/my-bids")}>
                  <h5>📝 My Bids</h5>
                  <p>Track your submitted proposals</p>
                </div>
                <div className="home-card" onClick={() => navigate("/earnings")}>
                  <h5>💰 Earnings</h5>
                  <p>View your payment history</p>
                </div>
              </>
            ) : (
              <>
                <div className="home-card" onClick={() => navigate("/post-job")}>
                  <h5>➕ Post Job</h5>
                  <p>Create a new freelance opportunity</p>
                </div>
                <div className="home-card" onClick={() => navigate("/client-dashboard")}>
                  <h5>📊 My Jobs</h5>
                  <p>Manage your posted jobs</p>
                </div>
                <div className="home-card" onClick={() => navigate("/profile")}>
                  <h5>👤 Profile</h5>
                  <p>Update your company information</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;