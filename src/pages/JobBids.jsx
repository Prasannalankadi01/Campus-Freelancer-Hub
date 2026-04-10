// src/pages/JobBids.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/FireBaseConfig';
import { doc, getDoc, collection, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './JobBids.css';

const JobBids = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingBid, setUpdatingBid] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionData, setActionData] = useState({ bidId: '', action: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', jobId));
        if (!jobDoc.exists()) {
          setError('Job not found');
          setLoading(false);
          return;
        }
        const jobData = { id: jobDoc.id, ...jobDoc.data() };
        if (jobData.createdBy !== user?.uid) {
          setError('You are not authorized to view bids for this job');
          setLoading(false);
          return;
        }
        setJob(jobData);

        const bidsQuery = query(collection(db, 'bids'), where('jobId', '==', jobId));
        const bidsSnapshot = await getDocs(bidsQuery);
        const bidsData = bidsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        bidsData.sort((a, b) => b.bidAmount - a.bidAmount);
        setBids(bidsData);
      } catch (err) {
        console.error(err);
        setError('Failed to load bids');
      } finally {
        setLoading(false);
      }
    };
    if (user && jobId) fetchData();
  }, [jobId, user]);

  const confirmAction = (bidId, action) => {
    setActionData({ bidId, action });
    setShowConfirmModal(true);
  };

  const handleUpdateBidStatus = async () => {
    const { bidId, action } = actionData;
    setUpdatingBid(bidId);
    setShowConfirmModal(false);
    try {
      await updateDoc(doc(db, 'bids', bidId), { status: action, updatedAt: new Date() });
      setBids(prev => prev.map(bid => bid.id === bidId ? { ...bid, status: action } : bid));
      alert(`Bid ${action} successfully!`);
      if (action === 'accepted') {
        const closeJob = window.confirm('Do you want to close this job? No more bids will be accepted.');
        if (closeJob) {
          await updateDoc(doc(db, 'jobs', jobId), { status: 'closed' });
          setJob(prev => ({ ...prev, status: 'closed' }));
        }
      }
    } catch (error) {
      console.error(error);
      alert(`Failed to update bid status: ${error.message}`);
    } finally {
      setUpdatingBid(null);
      setActionData({ bidId: '', action: '' });
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#f59e0b';
    }
  };
  const getStatusBg = (status) => {
    switch(status) {
      case 'accepted': return '#d1fae5';
      case 'rejected': return '#fee2e2';
      default: return '#fef3c7';
    }
  };

  if (loading) return <div className="job-bids-container"><div className="loading-container"><div className="spinner"></div><p>Loading bids...</p></div></div>;
  if (error) return <div className="job-bids-container"><div className="error-container"><h3>{error}</h3><button onClick={() => navigate('/client-dashboard')}>Back to Dashboard</button></div></div>;

  return (
    <div className="job-bids-container">
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm {actionData.action === 'accepted' ? 'Accept' : 'Reject'} Bid</h3>
            <p>Are you sure you want to {actionData.action} this bid?</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmModal(false)} className="modal-cancel-btn">Cancel</button>
              <button onClick={handleUpdateBidStatus} className={`modal-${actionData.action}-btn`}>Yes, {actionData.action} Bid</button>
            </div>
          </div>
        </div>
      )}

      <div className="job-bids-content">
        <div className="job-details-section">
          <button onClick={() => navigate('/client-dashboard')} className="back-button">← Back to Dashboard</button>
          <div className="job-info-card">
            <div className="job-header">
              <div className="job-icon-large">💼</div>
              <div>
                <h1>{job?.title}</h1>
                <p>Status: <span className={job?.status === 'open' ? 'status-open' : 'status-closed'}>{job?.status === 'open' ? ' Open for Bids' : ' Closed'}</span></p>
              </div>
            </div>
            <p className="job-full-description">{job?.desc}</p>
            <div className="job-meta-grid">
              <div className="meta-item"><span className="meta-label">💰 Budget</span><span className="meta-value">₹{job?.price?.toLocaleString()}</span></div>
              <div className="meta-item"><span className="meta-label">📅 Posted</span><span className="meta-date">{job?.createdAt?.toDate ? new Date(job.createdAt.toDate()).toLocaleDateString() : 'Recently'}</span></div>
              <div className="meta-item"><span className="meta-label">📊 Total Bids</span><span className="meta-value">{bids.length}</span></div>
            </div>
          </div>
        </div>

        <div className="bids-section">
          <div className="bids-header"><h2>Received Bids ({bids.length})</h2><p>Review and manage bids from students</p></div>
          {bids.length === 0 ? (
            <div className="no-bids-container"><div className="no-bids-icon">📭</div><h3>No bids yet</h3><button onClick={() => navigate('/client-dashboard')}>Back to Dashboard</button></div>
          ) : (
            <div className="bids-list">
              {bids.map((bid) => (
                <div key={bid.id} className="bid-card">
                  <div className="bid-header">
                    <div className="bidder-info">
                      <div className="bidder-avatar">{bid.userName?.charAt(0) || '👨‍🎓'}</div>
                      <div className="bidder-details">
                        <h4>{bid.userName || bid.userEmail?.split('@')[0] || 'Student'}</h4>
                        <p className="bidder-email">{bid.userEmail}</p>
                        <span className="bid-date">Submitted: {bid.createdAt?.toDate ? new Date(bid.createdAt.toDate()).toLocaleString() : 'Recently'}</span>
                      </div>
                    </div>
                    <div className="bid-amount"><span className="amount-label">Bid Amount</span><span className="amount-value">₹{bid.bidAmount?.toLocaleString()}</span></div>
                  </div>
                  {bid.message && <div className="bid-message"><strong>📝 Message:</strong><p>{bid.message}</p></div>}
                  <div className="bid-status-section">
                    <div className="current-status">Status: <span className="status-badge" style={{ background: getStatusBg(bid.status), color: getStatusColor(bid.status) }}>{bid.status || 'pending'}</span></div>
                    {bid.status === 'pending' && job?.status === 'open' && (
                      <div className="bid-actions">
                        <button className="accept-btn" onClick={() => confirmAction(bid.id, 'accepted')} disabled={updatingBid === bid.id}>Accept</button>
                        <button className="reject-btn" onClick={() => confirmAction(bid.id, 'rejected')} disabled={updatingBid === bid.id}>Reject</button>
                      </div>
                    )}
                    {bid.status === 'accepted' && <div className="accepted-message">✅ Accepted – Contact student at {bid.userEmail}</div>}
                    {bid.status === 'rejected' && <div className="rejected-message">❌ Rejected</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobBids;