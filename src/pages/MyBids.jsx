// src/pages/MyBids.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/FireBaseConfig';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './MyBids.css';

const MyBids = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bidToDelete, setBidToDelete] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const q = query(
          collection(db, 'bids'),
          where('userId', '==', user?.uid)
        );
        const snapshot = await getDocs(q);
        const bidsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort by date (newest first)
        bidsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
          return dateB - dateA;
        });
        setBids(bidsData);
      } catch (error) {
        console.error('Error fetching bids:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBids();
  }, [user]);

  const filteredBids = bids.filter(bid => {
    if (filter === 'all') return true;
    return bid.status === filter;
  });

  const getStatusConfig = (status) => {
    switch(status) {
      case 'accepted':
        return { icon: '✅', color: '#10b981', bg: '#d1fae5', text: 'Accepted' };
      case 'rejected':
        return { icon: '❌', color: '#ef4444', bg: '#fee2e2', text: 'Rejected' };
      default:
        return { icon: '⏳', color: '#f59e0b', bg: '#fef3c7', text: 'Pending' };
    }
  };

  const confirmDelete = (bid) => {
    if (bid.status !== 'pending') {
      alert('You can only delete pending bids.');
      return;
    }
    setBidToDelete(bid);
    setShowConfirmModal(true);
  };

  const handleDeleteBid = async () => {
    if (!bidToDelete) return;
    setDeletingId(bidToDelete.id);
    try {
      await deleteDoc(doc(db, 'bids', bidToDelete.id));
      setBids(bids.filter(b => b.id !== bidToDelete.id));
      alert('Bid deleted successfully!');
    } catch (error) {
      console.error('Error deleting bid:', error);
      alert('Failed to delete bid. Please try again.');
    } finally {
      setDeletingId(null);
      setShowConfirmModal(false);
      setBidToDelete(null);
    }
  };

  return (
    <div className="my-bids-container">
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete Bid</h3>
            <p>Are you sure you want to delete your bid for <strong>"{bidToDelete?.jobTitle}"</strong>?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowConfirmModal(false)} className="modal-cancel-btn">
                Cancel
              </button>
              <button onClick={handleDeleteBid} className="modal-delete-btn" disabled={deletingId === bidToDelete?.id}>
                {deletingId === bidToDelete?.id ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="my-bids-header">
        <h1>My Bids</h1>
        <p>Track all your submitted bids and their status</p>
      </div>

      {/* Filter Tabs */}
      <div className="bid-filters">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
          All Bids ({bids.length})
        </button>
        <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>
          Pending ({bids.filter(b => b.status === 'pending').length})
        </button>
        <button className={filter === 'accepted' ? 'active' : ''} onClick={() => setFilter('accepted')}>
          Accepted ({bids.filter(b => b.status === 'accepted').length})
        </button>
        <button className={filter === 'rejected' ? 'active' : ''} onClick={() => setFilter('rejected')}>
          Rejected ({bids.filter(b => b.status === 'rejected').length})
        </button>
      </div>

      {/* Bids Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your bids...</p>
        </div>
      ) : (
        <div className="bids-grid">
          {filteredBids.map((bid, index) => {
            const statusConfig = getStatusConfig(bid.status);
            return (
              <div key={bid.id} className="bid-card-modern" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="bid-status-badge" style={{ background: statusConfig.bg, color: statusConfig.color }}>
                  {statusConfig.icon} {statusConfig.text}
                </div>
                
                <div className="bid-header">
                  <div className="bid-icon">📝</div>
                  <div className="bid-info">
                    <h3>{bid.jobTitle || 'Job Title'}</h3>
                    <p className="bid-job-id">Job ID: {bid.jobId}</p>
                  </div>
                </div>
                
                <div className="bid-details">
                  <div className="bid-detail-item">
                    <span className="detail-label">💰 Bid Amount</span>
                    <span className="detail-amount">₹{bid.bidAmount}</span>
                  </div>
                  <div className="bid-detail-item">
                    <span className="detail-label">📅 Submitted On</span>
                    <span className="detail-date">
                      {bid.createdAt?.toDate ? new Date(bid.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
                
                {bid.message && (
                  <div className="bid-message">
                    <p><strong>Message:</strong> {bid.message}</p>
                  </div>
                )}
                
                <div className="bid-footer">
                  {bid.status === 'accepted' && (
                    <div className="success-message">
                      🎉 Congratulations! Your bid has been accepted.
                    </div>
                  )}
                  {bid.status === 'rejected' && (
                    <div className="reject-message">
                      😞 Unfortunately, your bid was not selected.
                    </div>
                  )}
                  {bid.status === 'pending' && (
                    <>
                      <div className="pending-message">
                        ⏳ Your bid is under review. You'll be notified once updated.
                      </div>
                      <button 
                        className="delete-bid-btn"
                        onClick={() => confirmDelete(bid)}
                      >
                        🗑️ Delete Bid
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {!loading && filteredBids.length === 0 && (
        <div className="no-bids-container">
          <div className="no-bids-icon">📭</div>
          <h3>No bids found</h3>
          <p>You haven't placed any bids yet. Start browsing jobs and place your first bid!</p>
          <button className="browse-jobs-btn" onClick={() => navigate('/jobs')}>
            Browse Jobs →
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBids;