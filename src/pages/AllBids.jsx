// src/pages/AllBids.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/FireBaseConfig';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './AllBids.css';

const AllBids = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [allBids, setAllBids] = useState([]);
  const [filteredBids, setFilteredBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingBid, setUpdatingBid] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionData, setActionData] = useState({ bidId: '', action: '' });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const jobsQuery = query(collection(db, 'jobs'), where('createdBy', '==', user?.uid));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsData = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setJobs(jobsData);

        const allBidsData = [];
        for (const job of jobsData) {
          const bidsQuery = query(collection(db, 'bids'), where('jobId', '==', job.id));
          const bidsSnapshot = await getDocs(bidsQuery);
          const bidsData = bidsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            jobTitle: job.title,
            jobPrice: job.price
          }));
          allBidsData.push(...bidsData);
        }

        allBidsData.sort((a, b) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));
        setAllBids(allBidsData);
        setFilteredBids(allBidsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchAllData();
  }, [user]);

  useEffect(() => {
    let results = [...allBids];
    if (selectedJob !== 'all') results = results.filter(bid => bid.jobId === selectedJob);
    if (filterStatus !== 'all') results = results.filter(bid => bid.status === filterStatus);
    setFilteredBids(results);
  }, [selectedJob, filterStatus, allBids]);

  const confirmAction = (bidId, action) => {
    setActionData({ bidId, action });
    setShowConfirmModal(true);
  };

  const handleUpdateBidStatus = async () => {
    const { bidId, action } = actionData;
    setUpdatingBid(bidId);
    setShowConfirmModal(false);
    try {
      const bidRef = doc(db, 'bids', bidId);
      await updateDoc(bidRef, { status: action, updatedAt: new Date() });
      setAllBids(prev => prev.map(bid => bid.id === bidId ? { ...bid, status: action } : bid));
      alert(`Bid ${action === 'accepted' ? 'accepted' : 'rejected'} successfully!`);
    } catch (error) {
      console.error('Error updating bid:', error);
      alert(`Failed to update bid status: ${error.message}`);
    } finally {
      setUpdatingBid(null);
      setActionData({ bidId: '', action: '' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#f59e0b';
    }
  };
  const getStatusBg = (status) => {
    switch (status) {
      case 'accepted': return '#d1fae5';
      case 'rejected': return '#fee2e2';
      default: return '#fef3c7';
    }
  };

  const getTotalBidsCount = () => allBids.length;
  const getPendingCount = () => allBids.filter(b => b.status === 'pending').length;
  const getAcceptedCount = () => allBids.filter(b => b.status === 'accepted').length;
  const getRejectedCount = () => allBids.filter(b => b.status === 'rejected').length;

  if (loading) {
    return (
      <div className="all-bids-container">
        <div className="loading-container"><div className="spinner"></div><p>Loading bids...</p></div>
      </div>
    );
  }

  return (
    <div className="all-bids-container">
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

      <div className="all-bids-content">
        <div className="all-bids-header">
          <h1>All Bids Received</h1>
          <p>View and manage all bids across your jobs</p>
        </div>

        <div className="stats-cards">
          <div className="stat-card total"><div className="stat-icon">📊</div><div className="stat-info"><h3>{getTotalBidsCount()}</h3><p>Total Bids</p></div></div>
          <div className="stat-card pending"><div className="stat-icon">⏳</div><div className="stat-info"><h3>{getPendingCount()}</h3><p>Pending</p></div></div>
          <div className="stat-card accepted"><div className="stat-icon">✅</div><div className="stat-info"><h3>{getAcceptedCount()}</h3><p>Accepted</p></div></div>
          <div className="stat-card rejected"><div className="stat-icon">❌</div><div className="stat-info"><h3>{getRejectedCount()}</h3><p>Rejected</p></div></div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>Filter by Job:</label>
            <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
              <option value="all">All Jobs ({jobs.length})</option>
              {jobs.map(job => <option key={job.id} value={job.id}>{job.title} (₹{job.price})</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Filter by Status:</label>
            <div className="status-filters">
              {['all', 'pending', 'accepted', 'rejected'].map(s => (
                <button key={s} className={filterStatus === s ? 'active' : ''} onClick={() => setFilterStatus(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredBids.length === 0 ? (
          <div className="no-bids"><div className="no-bids-icon">📭</div><h3>No bids found</h3><p>No bids match your current filters.</p></div>
        ) : (
          <div className="bids-table-container">
            <table className="bids-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Student</th>
                  <th>Bid Amount</th>
                  <th>Message</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBids.map((bid) => (
                  <tr key={bid.id} className={`bid-row ${bid.status}`}>
                    <td><strong>{bid.jobTitle}</strong><br/><small>Budget: ₹{bid.jobPrice}</small></td>
                    <td>{bid.userName || bid.userEmail?.split('@')[0]}<br/><small>{bid.userEmail}</small></td>
                    <td className="bid-amount">₹{bid.bidAmount?.toLocaleString()}</td>
                    <td className="bid-message-cell">{bid.message?.substring(0, 50) || '-'}</td>
                    <td>{bid.createdAt?.toDate ? new Date(bid.createdAt.toDate()).toLocaleDateString() : 'Recently'}</td>
                    <td><span className="status-badge" style={{ background: getStatusBg(bid.status), color: getStatusColor(bid.status) }}>{bid.status || 'pending'}</span></td>
                    <td>
                      {bid.status === 'pending' && (
                        <div className="action-buttons">
                          <button className="accept-btn" onClick={() => confirmAction(bid.id, 'accepted')} disabled={updatingBid === bid.id}>Accept</button>
                          <button className="reject-btn" onClick={() => confirmAction(bid.id, 'rejected')} disabled={updatingBid === bid.id}>Reject</button>
                        </div>
                      )}
                      {bid.status === 'accepted' && <span className="accepted-label">✅ Accepted</span>}
                      {bid.status === 'rejected' && <span className="rejected-label">❌ Rejected</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBids;