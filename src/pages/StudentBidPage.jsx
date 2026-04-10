// src/pages/StudentBidPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/FireBaseConfig';
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './StudentBidPage.css';

const StudentBidPage = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingBid, setExistingBid] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user?.uid) return; // ✅ prevent early execution

    const fetchJobAndCheckBid = async () => {
      try {
        // 🔹 Fetch Job
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));

        if (!jobDoc.exists()) {
          setError('Job not found');
          return;
        }

        const jobData = { id: jobDoc.id, ...jobDoc.data() };

        if (jobData.status !== 'open') {
          setError('This job is no longer accepting bids');
          return;
        }

        setJob(jobData);

        // 🔥 FIXED: use userId instead of userEmail
        const bidsQuery = query(
          collection(db, 'bids'),
          where('jobId', '==', jobId),
          where('userId', '==', user.uid)
        );

        const bidSnapshot = await getDocs(bidsQuery);

        if (!bidSnapshot.empty) {
          setExistingBid({
            id: bidSnapshot.docs[0].id,
            ...bidSnapshot.docs[0].data()
          });
        }

      } catch (err) {
        console.error(err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndCheckBid();

  }, [jobId, user?.uid]); // ✅ stable dependency

  // 🔥 Submit Bid
  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setError('');

    if (!bidAmount || bidAmount <= 0) {
      setError('Please enter a valid bid amount');
      return;
    }

    if (bidAmount > job?.price) {
      setError(`Bid amount cannot exceed job budget of ₹${job?.price}`);
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, 'bids'), {
        jobId: jobId,
        jobTitle: job.title,
        bidAmount: Number(bidAmount),
        message: message,

        // 🔥 MOST IMPORTANT
        userId: user.uid,

        // Optional but useful
        userEmail: user.email,
        userName: user.displayName || user.email?.split('@')[0],

        status: 'pending',
        createdAt: new Date()
      });

      alert('Bid placed successfully!');
      navigate('/my-bids');

    } catch (err) {
      console.error(err);
      setError('Failed to place bid. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // UI States
  if (loading) {
    return (
      <div className="student-bid-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-bid-container">
        <div className="error-container">
          <h3>{error}</h3>
          <button onClick={() => navigate('/jobs')}>
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  if (existingBid) {
    return (
      <div className="student-bid-container">
        <div className="existing-bid-container">
          <div className="existing-bid-icon">📝</div>
          <h2>You've Already Placed a Bid</h2>
          <p>You have already submitted a bid for this job.</p>

          <div className="existing-bid-card">
            <div><strong>Bid Amount:</strong> ₹{existingBid.bidAmount}</div>
            {existingBid.message && (
              <div><strong>Your Message:</strong> {existingBid.message}</div>
            )}
            <div><strong>Status:</strong> {existingBid.status}</div>
          </div>

          <button
            onClick={() => navigate('/my-bids')}
            className="view-bids-btn"
          >
            View My Bids
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-bid-container">
      <div className="student-bid-content">

        {/* Job Details */}
        <div className="job-details-section">
          <button
            onClick={() => navigate('/jobs')}
            className="back-button"
          >
            ← Back to Jobs
          </button>

          <div className="job-info-card">
            <div className="job-header">
              <div className="job-icon-large">💼</div>
              <h1>{job?.title}</h1>
            </div>

            <p className="job-full-description">{job?.desc}</p>

            <div className="job-meta-grid">
              <div>
                <span>💰 Budget</span>
                <strong>₹{job?.price}</strong>
              </div>

              <div>
                <span>📅 Posted</span>
                {job?.createdAt?.toDate
                  ? new Date(job.createdAt.toDate()).toLocaleDateString()
                  : 'Recently'}
              </div>

              {job?.category && (
                <div>
                  <span>📂 Category</span>
                  {job.category}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bid Form */}
        <div className="bid-form-section">
          <div className="bid-form-card">
            <h2>Place Your Bid</h2>

            <form onSubmit={handleSubmitBid}>
              <div className="form-group">
                <label>Your Bid Amount (₹)</label>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  min="1"
                  max={job?.price}
                  required
                />
                <small>Maximum: ₹{job?.price}</small>
              </div>

              <div className="form-group">
                <label>Message (Optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/jobs')}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Bid →'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentBidPage;