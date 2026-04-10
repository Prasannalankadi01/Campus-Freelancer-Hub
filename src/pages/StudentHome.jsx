// src/pages/StudentHome.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/FireBaseConfig';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './StudentHome.css';

const StudentHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentJobs, setRecentJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeBids: 0,
    earned: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch recent open jobs
        const jobsQuery = query(
          collection(db, 'jobs'),
          where('status', '==', 'open'),
          orderBy('createdAt', 'desc'),
          limit(6)
        );
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentJobs(jobsData);

        // Fetch user's bid stats
        const bidsQuery = query(
          collection(db, 'bids'),
          where('userEmail', '==', user?.email)
        );
        const bidsSnapshot = await getDocs(bidsQuery);
        const bidsData = bidsSnapshot.docs.map(doc => doc.data());
        
        const activeBids = bidsData.filter(b => b.status === 'pending').length;
        const earned = bidsData.filter(b => b.status === 'accepted').reduce((sum, b) => sum + (b.bidAmount || 0), 0);
        
        setStats({
          totalJobs: jobsData.length,
          activeBids: activeBids,
          earned: earned
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.uid,recentJobs,stats]);

  const features = [
    { icon: '💼', title: 'Find Jobs', desc: 'Browse hundreds of freelance opportunities from trusted clients' },
    { icon: '💰', title: 'Earn Money', desc: 'Get paid for your skills and build your portfolio' },
    { icon: '🚀', title: 'Grow Skills', desc: 'Work on real-world projects and improve your expertise' },
    { icon: '🏆', title: 'Get Hired', desc: 'Top performers get featured and direct job offers' }
  ];

  return (
    <div className="student-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome Back, <span className="highlight">{user?.displayName || user?.email?.split('@')[0]}!</span></h1>
          <p>Find freelance opportunities that match your skills and start earning today.</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate('/jobs')}>
              Browse Jobs →
            </button>
            <button className="btn-secondary" onClick={() => navigate('/my-bids')}>
              My Bids
            </button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <h3>{stats.totalJobs}</h3>
            <p>Open Jobs</p>
          </div>
          <div className="stat">
            <h3>{stats.activeBids}</h3>
            <p>Active Bids</p>
          </div>
          <div className="stat">
            <h3>₹{stats.earned}</h3>
            <p>Total Earned</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>Why Choose Campus Hub?</h2>
        <p>Your gateway to campus freelance success</p>
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
          <h2>Latest Opportunities</h2>
          <button onClick={() => navigate('/jobs')} className="view-all">View All →</button>
        </div>
        {loading ? (
          <div className="loading">Loading jobs...</div>
        ) : (
          <div className="jobs-grid">
            {recentJobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-badge">🟢 Open</div>
                <h3>{job.title}</h3>
                <p>{job.desc?.substring(0, 100)}...</p>
                <div className="job-footer">
                  <span className="price">₹{job.price}</span>
                  <button onClick={() => navigate(`/student-bid/${job.id}`)}>Bid Now →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Freelance Journey?</h2>
          <p>Join thousands of students already earning on Campus Hub</p>
          <button className="btn-primary" onClick={() => navigate('/jobs')}>
            Find Your First Job
          </button>
        </div>
      </section>
    </div>
  );
};

export default StudentHome;