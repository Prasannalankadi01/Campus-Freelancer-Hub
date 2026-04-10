// src/pages/Earnings.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase/FireBaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import './Earnings.css';

const Earnings = () => {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState({
    total: 0,
    completed: [],
    pending: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user) return;
      
      try {
        const bidsQuery = query(
          collection(db, 'bids'),
          where('userEmail', '==', user.email),
          where('status', 'in', ['accepted', 'completed'])
        );
        const snapshot = await getDocs(bidsQuery);
        
        const completedBids = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(bid => bid.status === 'completed');
        
        const pendingBids = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(bid => bid.status === 'accepted');
        
        const total = completedBids.reduce((sum, bid) => sum + (bid.bidAmount || 0), 0);
        
        setEarnings({
          total,
          completed: completedBids,
          pending: pendingBids
        });
      } catch (error) {
        console.error('Error fetching earnings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEarnings();
  }, [user]);

  if (loading) {
    return (
      <div className="earnings-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="earnings-container">
      <div className="earnings-content">
        <h1>💰 My Earnings</h1>
        
        <div className="total-earnings-card">
          <div className="total-label">Total Earnings</div>
          <div className="total-amount">₹{earnings.total}</div>
          <div className="total-sub">
            {earnings.completed.length} completed projects
          </div>
        </div>
        
        {earnings.pending.length > 0 && (
          <div className="earnings-section">
            <h2>Pending Payments</h2>
            <div className="earnings-list">
              {earnings.pending.map((bid) => (
                <div key={bid.id} className="earning-item pending">
                  <div className="earning-info">
                    <h4>{bid.jobTitle}</h4>
                    <p>Status: Awaiting completion</p>
                  </div>
                  <div className="earning-amount">₹{bid.bidAmount}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="earnings-section">
          <h2>Completed Payments</h2>
          {earnings.completed.length === 0 ? (
            <div className="empty-state">
              <p>No completed payments yet.</p>
            </div>
          ) : (
            <div className="earnings-list">
              {earnings.completed.map((bid) => (
                <div key={bid.id} className="earning-item completed">
                  <div className="earning-info">
                    <h4>{bid.jobTitle}</h4>
                    <p>Completed</p>
                  </div>
                  <div className="earning-amount">₹{bid.bidAmount}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Earnings;