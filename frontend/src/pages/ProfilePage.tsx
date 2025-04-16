// src/pages/ProfilePage.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.config';
import '../styles/DetailPages.css';

interface UserData {
  id: number;
  utorid: string;
  name: string;
  email: string;
  birthday: string;
  role: string;
  points: number;
  createdAt: string;
  lastLogin: string;
  verified: boolean;
  avatarUrl: string;
  promotions?: any[];
}

const ProfilePage: React.FC = () => {
  // const navigate = useNavigate();
  
  // Basic user state
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Edit mode state for profile data
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ name: string; email: string; birthday: string }>({
    name: '',
    email: '',
    birthday: ''
  });
  
  // Password change state
  const [passwordEditMode, setPasswordEditMode] = useState<boolean>(false);
  const [oldPassword, setOldPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  // Get current user's UTORid and token from localStorage
  const currentUser = localStorage.getItem('currentUser');
  const token = currentUser ? localStorage.getItem(`token_${currentUser}`) : '';

  // Fetch user data via direct fetch call (GET /users/me)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
          },
          credentials: 'include'
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch user data');
        }
        const data: UserData = await response.json();
        setUser(data);
        setFormData({
          name: data.name,
          email: data.email,
          birthday: data.birthday
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Handlers for switching to edit mode
  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        birthday: user.birthday
      });
    }
    setEditMode(false);
    setError(null);
  };

  // Handle changes for profile form
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle profile update submission (PATCH /users/me)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    // Build an update object with only changed fields
    const updates: Record<string, any> = {};
    if (user && formData.name !== user.name) updates.name = formData.name;
    if (user && formData.email !== user.email) updates.email = formData.email;
    if (user && formData.birthday !== user.birthday) updates.birthday = formData.birthday;

    // If nothing changed, simply exit edit mode
    if (Object.keys(updates).length === 0) {
      setEditMode(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      const updatedUser: UserData = await response.json();
      setUser(updatedUser);
      setEditMode(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handlers for password change toggle
  const handlePasswordToggle = () => {
    setPasswordEditMode(!passwordEditMode);
    setPwError(null);
    setPwSuccess(null);
  };

  // Handle password change submission (PATCH /users/me/password)
  const handlePasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    
    // Construct payload for changing password
    const payload = { old: oldPassword, new: newPassword };
    
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update password');
      }
      
      // Password update successful
      setPwSuccess('Password updated successfully!');
      // Optionally clear the inputs after success:
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPwError(err.message);
    }
  };

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;
  if (!user) return <p>No user information available.</p>;

  return (
    <div className="detail-page-container">
      <h1>Profile</h1>
      {!editMode ? (
        <div className="detail-content">
          <div className="detail-field">
            <strong>Id:</strong>
            <span>{user.id}</span>
          </div>
          <div className="detail-field">
            <strong>UTORid:</strong>
            <span>{user.utorid}</span>
          </div>
          <div className="detail-field">
            <strong>Name:</strong>
            <span>{user.name}</span>
          </div>
          <div className="detail-field">
            <strong>Email:</strong>
            <span>{user.email}</span>
          </div>
          <div className="detail-field">
            <strong>Birthday:</strong>
            <span>{user.birthday}</span>
          </div>
          <div className="detail-field">
            <strong>Role:</strong>
            <span>{user.role}</span>
          </div>
          <div className="detail-field">
            <strong>Points:</strong>
            <span>{user.points}</span>
          </div>
          <div className="detail-field">
            <strong>Created At:</strong>
            <span>{new Date(user.createdAt).toLocaleString()}</span>
          </div>
          <div className="detail-field">
            <strong>Last Login:</strong>
            <span>{new Date(user.lastLogin).toLocaleString()}</span>
          </div>
          <div className="detail-field">
            <strong>Verified:</strong>
            <span>
              {user.verified ? 
                <span className="status-indicator status-positive">Yes</span> : 
                <span className="status-indicator status-negative">No</span>}
            </span>
          </div>
          
          <div className="action-buttons">
            <button onClick={handleEditClick} className="detail-button primary-button">Edit Profile</button>
            <button onClick={handlePasswordToggle} className="detail-button secondary-button">
              {passwordEditMode ? 'Cancel Password Change' : 'Change Password'}
            </button>
          </div>
          
          {passwordEditMode && (
            <form onSubmit={handlePasswordSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="oldPassword"><strong>Current Password:</strong></label>
                <input
                  type="password"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword"><strong>New Password:</strong></label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                />
              </div>
              <div className="action-buttons">
                <button type="submit" className="detail-button primary-button">Update Password</button>
              </div>
              {pwError && <p className="error-message">{pwError}</p>}
              {pwSuccess && <p className="success-message">{pwSuccess}</p>}
            </form>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="name"><strong>Name:</strong></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email"><strong>Email:</strong></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="birthday"><strong>Birthday:</strong></label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleChange}
            />
          </div>
          <div className="action-buttons">
            <button type="submit" className="detail-button primary-button">Save Changes</button>
            <button type="button" onClick={handleCancel} className="detail-button secondary-button">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
