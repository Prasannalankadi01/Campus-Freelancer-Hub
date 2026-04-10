// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/FireBaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import './Profile.css';

const Profile = () => {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    skills: [],
    education: '',
    experience: '',
    phone: '',
    location: '',
    github: '',
    linkedin: '',
    portfolio: ''
  });
  const [newSkill, setNewSkill] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Fetch user profile data
  useEffect(() => {
    if (!user?.uid) return;
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!isMounted) return;

        if (userDoc.exists()) {
          const data = userDoc.data();
          setProfileData({
            displayName: data.displayName || user.displayName || '',
            bio: data.bio || '',
            skills: data.skills || [],
            education: data.education || '',
            experience: data.experience || '',
            phone: data.phone || '',
            location: data.location || '',
            github: data.github || '',
            linkedin: data.linkedin || '',
            portfolio: data.portfolio || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [user?.uid]);

  // Add skill
  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  // Remove skill
  const removeSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  // Save profile
  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const userData = {
        displayName: profileData.displayName,
        bio: profileData.bio,
        skills: profileData.skills,
        education: profileData.education,
        experience: profileData.experience,
        phone: profileData.phone,
        location: profileData.location,
        github: profileData.github,
        linkedin: profileData.linkedin,
        portfolio: profileData.portfolio,
        email: user.email,
        role: role,
        updatedAt: new Date()
      };

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, userData);

      // Update Auth display name
      if (profileData.displayName && profileData.displayName !== user.displayName) {
        await updateProfile(user, { displayName: profileData.displayName });
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile: ' + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        <div className="profile-header">
          <h1>My Profile</h1>
          <p>Manage your personal information</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-grid">
          {/* Left Column */}
          <div className="profile-left">
            {/* Basic Info */}
            <div className="profile-card">
              <h3>Basic Information</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={user?.email || ''} disabled className="disabled-input" />
                <small>Email cannot be changed</small>
              </div>
              <div className="form-group">
                <label>Role</label>
                <input type="text" value={role === 'student' ? 'Student' : 'Client'} disabled className="disabled-input" />
              </div>
            </div>

            {/* Contact Info */}
            <div className="profile-card">
              <h3>Contact Information</h3>
              <div className="form-group">
                <label>📞 Phone Number</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="+91 12345 67890"
                />
              </div>
              <div className="form-group">
                <label>📍 Location</label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  placeholder="City, State"
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="profile-card">
              <h3>Social & Portfolio Links</h3>
              <div className="form-group">
                <label>🔗 GitHub</label>
                <input
                  type="url"
                  value={profileData.github}
                  onChange={(e) => setProfileData({...profileData, github: e.target.value})}
                  placeholder="https://github.com/username"
                />
              </div>
              <div className="form-group">
                <label>💼 LinkedIn</label>
                <input
                  type="url"
                  value={profileData.linkedin}
                  onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="form-group">
                <label>🌐 Portfolio</label>
                <input
                  type="url"
                  value={profileData.portfolio}
                  onChange={(e) => setProfileData({...profileData, portfolio: e.target.value})}
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="profile-right">
            {/* Bio */}
            <div className="profile-card">
              <h3>About Me</h3>
              <div className="form-group">
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              </div>
            </div>

            {/* Skills */}
            <div className="profile-card">
              <h3>Skills</h3>
              <div className="skills-section">
                <div className="skills-list">
                  {profileData.skills.map((skill, index) => (
                    <div key={index} className="skill-tag">
                      {skill}
                      <button onClick={() => removeSkill(skill)}>✕</button>
                    </div>
                  ))}
                </div>
                <div className="add-skill">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button onClick={addSkill}>+ Add</button>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="profile-card">
              <h3>Education</h3>
              <textarea
                value={profileData.education}
                onChange={(e) => setProfileData({...profileData, education: e.target.value})}
                placeholder="Your educational background..."
                rows="3"
              />
            </div>

            {/* Experience */}
            <div className="profile-card">
              <h3>Experience</h3>
              <textarea
                value={profileData.experience}
                onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                placeholder="Your work experience..."
                rows="4"
              />
            </div>

            {/* Save Button */}
            <div className="profile-actions">
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;