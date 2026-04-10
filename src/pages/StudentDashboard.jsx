// src/pages/StudentDashboard.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/FireBaseConfig';
import { 
  collection, getDocs, query, where, 
  orderBy, limit 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalBids: 0,
    activeBids: 0,
    acceptedBids: 0,
    totalEarnings: 0
  });
  const [recentBids, setRecentBids] = useState([]);
  const [availableJobs, setAvailableJobs] = useState([]); // Changed from recommendedJobs
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!user) return;

  const fetchDashboardData = async () => {
    try {
      // ✅ Use userId instead of email
      const bidsQuery = query(
        collection(db, 'bids'),
        where('userId', '==', user.uid)
      );

      const bidsSnapshot = await getDocs(bidsQuery);
      const bidsData = bidsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Stats
      const accepted = bidsData.filter(b => b.status === 'accepted');
      const pending = bidsData.filter(b => b.status === 'pending');

      const totalEarnings = accepted.reduce(
        (sum, bid) => sum + (bid.bidAmount || 0),
        0
      );

      setStats({
        totalBids: bidsData.length,
        activeBids: pending.length,
        acceptedBids: accepted.length,
        totalEarnings
      });

      // ✅ Recent bids (with order)
      const recentQuery = query(
        collection(db, 'bids'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );

      const recentSnapshot = await getDocs(recentQuery);
      setRecentBids(
        recentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

      // ✅ Jobs (same as before)
      const jobsQuery = query(
        collection(db, 'jobs'),
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc'),
        limit(6)
      );

      const jobsSnapshot = await getDocs(jobsQuery);
      setAvailableJobs(
        jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      );

    } catch (error) {
      console.error('Error fetching dashboard data:', error);

      // ✅ fallback (no orderBy)
      try {
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('status', '==', 'open')
        );

        const jobsSnapshot = await getDocs(jobsQuery);
        setAvailableJobs(
          jobsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        );
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  fetchDashboardData();
}, [user?.uid]); // ✅ FIXED dependency
  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#f59e0b';
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

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1>Welcome back, {user?.displayName || user?.email?.split('@')[0]}! 👋</h1>
          <p>Track your bids, earnings, and find new opportunities</p>
        </div>
        
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
            <div className="stat-icon">📊</div>
            <div className="stat-info">
              <h3>{stats.totalBids}</h3>
              <p>Total Bids</p>
            </div>
          </div>
          
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.activeBids}</h3>
              <p>Active Bids</p>
            </div>
          </div>
          
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.acceptedBids}</h3>
              <p>Accepted</p>
            </div>
          </div>
          
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>₹{stats.totalEarnings.toLocaleString()}</h3>
              <p>Total Earnings</p>
            </div>
          </div>
        </div>
        
        {/* Recent Bids Section */}
        <div className="section">
          <div className="section-header">
            <h2>Recent Bids</h2>
            <button onClick={() => navigate('/my-bids')} className="view-all-btn">
              View All →
            </button>
          </div>
          
          {recentBids.length === 0 ? (
            <div className="empty-state">
              <p>You haven't placed any bids yet.</p>
              <button onClick={() => navigate('/jobs')} className="primary-btn">
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="bids-list">
              {recentBids.map((bid) => (
                <div key={bid.id} className="bid-item">
                  <div className="bid-info">
                    <h4>{bid.jobTitle}</h4>
                    <p>Bid: ₹{bid.bidAmount}</p>
                  </div>
                  <div className="bid-status" style={{ color: getStatusColor(bid.status) }}>
                    {bid.status?.toUpperCase() || 'PENDING'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 🔥 Available Jobs Section - Shows jobs posted by clients */}
        <div className="section">
          <div className="section-header">
            <h2>Available Jobs for You</h2>
            <button onClick={() => navigate('/jobs')} className="view-all-btn">
              View All Jobs →
            </button>
          </div>
          
          {availableJobs.length === 0 ? (
            <div className="empty-state">
              <p>No jobs available at the moment. Check back later!</p>
            </div>
          ) : (
            <div className="jobs-grid">
              {availableJobs.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-card-badge">
                    <span className="badge-open">🟢 Open</span>
                  </div>
                  <div className="job-card-header">
                    <div className="job-icon">{getCategoryIcon(job.category)}</div>
                    <h4>{job.title}</h4>
                  </div>
                  <p className="job-desc">{job.desc?.substring(0, 80)}...</p>
                  <div className="job-price">💰 ₹{job.price?.toLocaleString()}</div>
                  <button 
                    onClick={() => navigate(`/job-bids/${job.id}`)}
                    className="bid-btn"
                  >
                    Bid Now →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;