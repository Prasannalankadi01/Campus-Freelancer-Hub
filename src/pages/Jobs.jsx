import React, { useState, useEffect } from 'react';
import { db } from '../firebase/FireBaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Jobs.css';

const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);

  // Fetch all open jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        // Fetch only open jobs
        const jobsRef = collection(db, 'jobs');
        const q = query(jobsRef, where('status', '==', 'open'));
        const snapshot = await getDocs(q);
        
        const jobsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Fetched jobs:', jobsData.length);
        setAllJobs(jobsData);
        setFilteredJobs(jobsData);
        
        // Extract unique categories
        const uniqueCategories = ['all', ...new Set(jobsData.map(job => job.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
      } catch (error) {
        console.error('Error fetching jobs:', error);
        // Fallback: fetch all jobs without filter
        try {
          const jobsRef = collection(db, 'jobs');
          const snapshot = await getDocs(jobsRef);
          const jobsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          const openJobs = jobsData.filter(job => job.status === 'open');
          setAllJobs(openJobs);
          setFilteredJobs(openJobs);
          const uniqueCategories = ['all', ...new Set(openJobs.map(job => job.category).filter(Boolean))];
          setCategories(uniqueCategories);
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, []);

  // Apply filters and search whenever dependencies change
  useEffect(() => {
    let results = [...allJobs];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      results = results.filter(job => 
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply budget filter
    if (filter !== 'all') {
      results = results.filter(job => {
        if (filter === 'high') return job.price >= 1000;
        if (filter === 'medium') return job.price >= 500 && job.price < 1000;
        if (filter === 'low') return job.price < 500;
        return true;
      });
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      results = results.filter(job => job.category === selectedCategory);
    }
    
    setFilteredJobs(results);
  }, [searchTerm, filter, selectedCategory, allJobs]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
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

  const getTimeAgo = (timestamp) => {
    if (!timestamp?.toDate) return 'Recently';
    const date = timestamp.toDate();
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // ✅ FIXED: Redirect to student bid page
  const handleBidNow = (jobId) => {
    console.log('Bid Now clicked for job:', jobId);
    if (user) {
      navigate(`/student-bid/${jobId}`);
    } else {
      alert('Please login to place a bid');
      navigate('/signin');
    }
  };

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h1>Browse Available Jobs</h1>
        <p>Find the perfect freelance opportunity for your skills</p>
      </div>

      {/* Search Bar */}
      <div className="search-bar-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search jobs by title, description, or category..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <button className="clear-search" onClick={clearSearch}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-group">
          <label>💰 Budget Range</label>
          <div className="filter-buttons">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
              All Jobs
            </button>
            <button className={filter === 'high' ? 'active' : ''} onClick={() => setFilter('high')}>
              High (₹1000+)
            </button>
            <button className={filter === 'medium' ? 'active' : ''} onClick={() => setFilter('medium')}>
              Medium (₹500-1000)
            </button>
            <button className={filter === 'low' ? 'active' : ''} onClick={() => setFilter('low')}>
              Low (₹500-)
            </button>
          </div>
        </div>

        {categories.length > 1 && (
          <div className="filter-group">
            <label>📂 Category</label>
            <div className="category-buttons">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={selectedCategory === cat ? 'active' : ''}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Stats */}
      <div className="results-stats">
        <p>
          Showing <span className="highlight">{filteredJobs.length}</span> of{' '}
          <span className="total">{allJobs.length}</span> available jobs
        </p>
        {searchTerm && (
          <p className="search-query">
            Searching for: <strong>"{searchTerm}"</strong>
          </p>
        )}
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      ) : (
        <>
          {filteredJobs.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No jobs found</h3>
              <p>
                {searchTerm 
                  ? `No jobs matching "${searchTerm}" were found.` 
                  : 'No jobs available at the moment.'}
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilter('all');
                  setSelectedCategory('all');
                }} 
                className="clear-filters-btn"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="jobs-grid">
              {filteredJobs.map((job, index) => (
                <div key={job.id} className="job-card-modern" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card-badge open">
                    <span className="badge-dot"></span>
                    Open for Bids
                  </div>
                  
                  <div className="card-header">
                    <div className="job-icon">{getCategoryIcon(job.category)}</div>
                    <h3>{job.title}</h3>
                  </div>
                  
                  <p className="job-description">
                    {job.desc ? (job.desc.length > 120 ? job.desc.substring(0, 120) + '...' : job.desc) : 'No description provided'}
                  </p>
                  
                  <div className="job-details-modern">
                    <div className="detail-item">
                      <span className="detail-label">💰 Budget</span>
                      <span className="detail-value">₹{job.price?.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">📅 Posted</span>
                      <span className="detail-date">{getTimeAgo(job.createdAt)}</span>
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
                      className="bid-now-btn"
                      onClick={() => handleBidNow(job.id)}
                    >
                      Bid Now
                      <span className="btn-arrow">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Jobs;