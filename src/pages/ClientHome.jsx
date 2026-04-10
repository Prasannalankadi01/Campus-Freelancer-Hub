// src/pages/ClientHome.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/FireBaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './ClientHome.css';

const ClientHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalBids: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch client's jobs
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('createdBy', '==', user?.uid)
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const activeJobs = jobsData.filter(job => job.status === 'open').length;
        setRecentJobs(jobsData.slice(0, 4));
        
        // Fetch total bids across all jobs
        let totalBids = 0;
        for (const job of jobsData) {
          const bidsQuery = query(collection(db, 'bids'), where('jobId', '==', job.id));
          const bidsSnapshot = await getDocs(bidsQuery);
          totalBids += bidsSnapshot.size;
        }
        
        setStats({
          totalJobs: jobsData.length,
          activeJobs: activeJobs,
          totalBids: totalBids
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const features = [
    { icon: '📝', title: 'Post Jobs', desc: 'Create detailed job posts and attract talented students' },
    { icon: '👥', title: 'Review Bids', desc: 'Compare proposals and choose the best fit' },
    { icon: '✅', title: 'Hire & Manage', desc: 'Track progress and complete projects successfully' },
    { icon: '📈', title: 'Grow Business', desc: 'Build your brand and get quality work done' }
  ];

  return (
    <div className="client-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome Back, <span className="highlight">{user?.displayName || user?.email?.split('@')[0]}!</span></h1>
          <p>Post jobs, review bids, and hire the best student talent on campus.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/post-job')}>
              Post a Job →
            </button>
            <button className="btn-secondary" onClick={() => navigate('/client-dashboard')}>
              Dashboard
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <h3>{stats.totalJobs}</h3>
            <p>Jobs Posted</p>
          </div>
          <div className="stat">
            <h3>{stats.activeJobs}</h3>
            <p>Active Jobs</p>
          </div>
          <div className="stat">
            <h3>{stats.totalBids}</h3>
            <p>Total Bids</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Post on Campus Hub?</h2>
        <p>Connect with skilled students ready to work</p>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Jobs Section */}
      <section className="recent-jobs">
        <div className="section-header">
          <h2>Your Recent Jobs</h2>
          <button onClick={() => navigate('/client-dashboard')} className="view-all">View All →</button>
        </div>
        {loading ? (
          <div className="loading">Loading...</div>
        ) : recentJobs.length === 0 ? (
          <div className="empty-state">
            <p>You haven't posted any jobs yet.</p>
            <button onClick={() => navigate('/post-job')} className="btn-primary">Post Your First Job</button>
          </div>
        ) : (
          <div className="jobs-grid">
            {recentJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className={`job-status ${job.status}`}>{job.status === 'open' ? '🟢 Open' : '🔴 Closed'}</div>
                <h3>{job.title}</h3>
                <p>{job.desc?.substring(0, 80)}...</p>
                <div className="job-footer">
                  <span className="price">₹{job.price}</span>
                  <button onClick={() => navigate(`/job-bids/${job.id}`)}>View Bids →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Find Your Next Talent?</h2>
          <p>Post a job and receive bids from qualified students today</p>
          <button className="btn-primary" onClick={() => navigate('/post-job')}>
            Post a Job Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default ClientHome;