// src/pages/PageNotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './PageNotFound.css';

const PageNotFound = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const handleGoHome = () => {
    if (user) {
      navigate(role === 'client' ? '/client-home' : '/student-home');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">🔍</div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-buttons">
          <button onClick={handleGoHome} className="home-btn">
            🏠 Go Home
          </button>
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Go Back
          </button>
        </div>
        <div className="not-found-suggestions">
          <p>You might want to check:</p>
          <ul>
            <li>• The URL for typos</li>
            <li>• Your dashboard if you're logged in</li>
            <li>• The navigation menu above</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;