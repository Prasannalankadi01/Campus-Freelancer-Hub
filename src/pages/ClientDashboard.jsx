import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/FireBaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import "./ClientDashboard.css";

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalSpent: 0,
    activeJobs: 0,
    completedJobs: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);

  // 🔥 Fetch Client Jobs
  const fetchJobs = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const q = query(
        collection(db, "jobs"),
        where("createdBy", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const jobsData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));

      setJobs(jobsData);

      // Calculate stats
      const totalSpent = jobsData.reduce((sum, job) => sum + (job.price || 0), 0);
      const activeJobs = jobsData.filter(job => job.status === "open").length;
      const completedJobs = jobsData.filter(job => job.status === "completed").length;

      setStats({
        totalJobs: jobsData.length,
        totalSpent: totalSpent,
        activeJobs: activeJobs,
        completedJobs: completedJobs,
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [user]);

  // 🔥 Delete Job
  const handleDeleteJob = async (jobId) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await deleteDoc(doc(db, "jobs", jobId));
        alert("Job deleted successfully!");
        fetchJobs(); // Refresh the list
      } catch (error) {
        console.error("Error deleting job:", error);
        alert("Failed to delete job");
      }
    }
  };

  // 🔥 Close/Open Job
  const handleToggleJobStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === "open" ? "closed" : "open";
    try {
      await updateDoc(doc(db, "jobs", jobId), {
        status: newStatus,
      });
      alert(`Job ${newStatus} successfully!`);
      fetchJobs(); // Refresh the list
    } catch (error) {
      console.error("Error updating job status:", error);
      alert("Failed to update job status");
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'development': return '💻';
      case 'design': return '🎨';
      case 'writing': return '✍️';
      case 'marketing': return '📈';
      default: return '💼';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return '#10b981';
      case 'closed': return '#ef4444';
      case 'completed': return '#3b82f6';
      default: return '#f59e0b';
    }
  };

  return (
    <div className="client-dashboard-container">
      <div className="client-dashboard-main">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-left">
            <h1 className="dashboard-title">Client Dashboard</h1>
            <p className="dashboard-subtitle">Manage your posted jobs and track bids</p>
          </div>
          <div className="header-actions">
            <button
              className="btn-post-job"
              onClick={() => navigate("/post-job")}
            >
              <span>➕</span> Post New Job
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards-container">
          <div className="stat-card stat-card-total">
            <div className="stat-card-icon">📊</div>
            <div className="stat-card-info">
              <h3>{stats.totalJobs}</h3>
              <p>Total Jobs Posted</p>
            </div>
            <div className="stat-card-trend">
              <span className="trend-up">↑ 12%</span>
            </div>
          </div>

          <div className="stat-card stat-card-active">
            <div className="stat-card-icon">🟢</div>
            <div className="stat-card-info">
              <h3>{stats.activeJobs}</h3>
              <p>Active Jobs</p>
            </div>
            <div className="stat-card-trend">
              <span className="trend-up">↑ 8%</span>
            </div>
          </div>

          <div className="stat-card stat-card-completed">
            <div className="stat-card-icon">✅</div>
            <div className="stat-card-info">
              <h3>{stats.completedJobs}</h3>
              <p>Completed Jobs</p>
            </div>
            <div className="stat-card-trend">
              <span className="trend-up">↑ 23%</span>
            </div>
          </div>

          <div className="stat-card stat-card-spent">
            <div className="stat-card-icon">💰</div>
            <div className="stat-card-info">
              <h3>₹{stats.totalSpent.toLocaleString()}</h3>
              <p>Total Spent</p>
            </div>
            <div className="stat-card-trend">
              <span className="trend-up">↑ 15%</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your jobs...</p>
          </div>
        )}

        {/* No Jobs State */}
        {!loading && jobs.length === 0 && (
          <div className="no-jobs-container">
            <div className="no-jobs-icon">🚀</div>
            <h3>No jobs posted yet</h3>
            <p>Click the "Post New Job" button to get started</p>
            <button
              className="btn-post-job-primary"
              onClick={() => navigate("/post-job")}
            >
              Post Your First Job
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        {!loading && jobs.length > 0 && (
          <div className="jobs-section">
            <div className="section-header">
              <h2>Your Posted Jobs</h2>
              <span className="job-count">{jobs.length} total</span>
            </div>

            <div className="jobs-grid">
              {jobs.map((job, index) => (
                <div key={job.id} className="job-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card-badge" style={{ background: getStatusColor(job.status) + '20', color: getStatusColor(job.status) }}>
                    {job.status === 'open' ? '🟢 Open' : job.status === 'completed' ? '✅ Completed' : '🔴 Closed'}
                  </div>
                  
                  <div className="card-header">
                    <div className="job-icon">{getCategoryIcon(job.category)}</div>
                    <h3>{job.title}</h3>
                  </div>
                  
                  <p className="job-description">{job.desc || "No description provided"}</p>
                  
                  <div className="job-details">
                    <div className="detail-item">
                      <span className="detail-label">💰 Budget</span>
                      <span className="detail-value">₹{job.price}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">📅 Posted</span>
                      <span className="detail-date">
                        {job.createdAt?.toDate ? new Date(job.createdAt.toDate()).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    {job.category && (
                      <div className="detail-item">
                        <span className="detail-label">📂 Category</span>
                        <span className="detail-category">{job.category}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-footer">
                    <button
                      className="btn-view-bids"
                      onClick={() => navigate(`/job-bids/${job.id}`)}
                    >
                      View Bids
                      <span className="btn-arrow">→</span>
                    </button>
                    
                    <div className="card-actions">
                      <button
                        className="btn-toggle-status"
                        onClick={() => handleToggleJobStatus(job.id, job.status)}
                        title={job.status === "open" ? "Close Job" : "Open Job"}
                      >
                        {job.status === "open" ? "🔒 Close" : "🔓 Open"}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteJob(job.id)}
                        title="Delete Job"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;