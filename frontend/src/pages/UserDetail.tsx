// src/pages/UserDetailPage.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.config';
import '../styles/DetailPages.css';

interface UserData {
  id: number;
  utorid: string;
  name: string;
  email?: string;
  birthday?: string;
  role: string;
  points: number;
  verified: boolean;
  avatarUrl?: string | null;
  promotions?: any[]; // Directly using the returned promotions from endpoint
  createdAt?: string;
  lastLogin?: string;
}

const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);

  // State for editing: fields that managers/superusers can update.
  const [formData, setFormData] = useState({
    email: '',
    verified: false,
    suspicious: false,
    role: ''
  });

  // Get currently logged in user's identifier and token/role from localStorage.
  const currentUser = localStorage.getItem('currentUser');
  const token = currentUser ? localStorage.getItem(`token_${currentUser}`) : '';
  // The role of the logged-in user (determines what can be edited)
  const currentUserRole = currentUser ? localStorage.getItem(`current_role_${currentUser}`) || '' : '';

  // Fetch user data from endpoint GET /users/:userId
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
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
          email: data.email || '',
          verified: data.verified,
          suspicious: (data as any).suspicious || false,
          role: data.role
        });
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, token]);

  // Handlers for edit mode
  const handleEditClick = () => setEditMode(true);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        email: user.email || '',
        verified: user.verified,
        suspicious: (user as any).suspicious || false,
        role: user.role
      });
    }
    setEditMode(false);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!user) return;

    const updates: Record<string, any> = {};
    if (formData.email !== user.email) updates.email = formData.email;
    if (formData.verified !== user.verified) updates.verified = true;
    if ((formData as any).suspicious !== ((user as any).suspicious || false))
      updates.suspicious = formData.suspicious;
    if (formData.role !== user.role) updates.role = formData.role;

    if (Object.keys(updates).length === 0) {
      setEditMode(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
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
        throw new Error(data.error || 'Failed to update user');
      }
      const updatedUser: UserData = await response.json();
      setUser(updatedUser);
      setEditMode(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading user details...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;
  if (!user) return <p>No user information available.</p>;

  // Render based on the current user's role.
  const renderUserInfo = () => {
    if (currentUserRole === 'cashier') {
      return (
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
            <strong>Points:</strong>
            <span>{user.points}</span>
          </div>
          <div className="detail-field">
            <strong>Verified:</strong>
            <span>
              {user.verified ? 
                <span className="status-indicator status-positive">Yes</span> : 
                <span className="status-indicator status-negative">No</span>}
            </span>
          </div>

          {user.promotions && user.promotions.length > 0 && (
            <div className="detail-section">
              <h3>Available Promotions</h3>
              <div className="list-group">
                {user.promotions.map((promo, idx) => (
                  <div key={idx} className="list-item">
                    <strong>ID:</strong> {promo.id} | <strong>Name:</strong> {promo.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons">

            <button onClick={() => navigate(`/users`)} className="detail-button secondary-button">
              Back to Users List
            </button>
          </div>
        </div>
      );
    } else {
      // For managers or superusers: display full details
      return (
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

          {user.birthday && (
            <div className="detail-field">
              <strong>Birthday:</strong>
              <span>{user.birthday}</span>
            </div>
          )}

          <div className="detail-field">
            <strong>Role:</strong>
            <span>{user.role}</span>
          </div>

          <div className="detail-field">
            <strong>Points:</strong>
            <span>{user.points}</span>
          </div>

          {user.createdAt && (
            <div className="detail-field">
              <strong>Created At:</strong>
              <span>{new Date(user.createdAt).toLocaleString()}</span>
            </div>
          )}

          {user.lastLogin && (
            <div className="detail-field">
              <strong>Last Login:</strong>
              <span>{new Date(user.lastLogin).toLocaleString()}</span>
            </div>
          )}

          <div className="detail-field">
            <strong>Verified:</strong>
            <span>
              {user.verified ? 
                <span className="status-indicator status-positive">Yes</span> : 
                <span className="status-indicator status-negative">No</span>}
            </span>
          </div>

          {user.avatarUrl && (
            <div className="detail-field">
              <strong>Avatar:</strong>
              <span>
                <img src={user.avatarUrl} alt="Avatar" className="detail-image" />
              </span>
            </div>
          )}

          {user.promotions && user.promotions.length > 0 && (
            <div className="detail-section">
              <h3>Available Promotions</h3>
              <div className="list-group">
                {user.promotions.map((promo, idx) => (
                  <div key={idx} className="list-item">
                    <strong>ID:</strong> {promo.id} | <strong>Name:</strong> {promo.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(currentUserRole === 'manager' || currentUserRole === 'superuser') && (
            <div className="action-buttons">
              <button onClick={() => navigate(`/users`)} className="detail-button secondary-button">
                Back to Users List
              </button>
              <button onClick={handleEditClick} className="detail-button primary-button">
                Edit User Details
              </button>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="detail-page-container">
      <h1>User Details</h1>

      {!editMode ? (
        renderUserInfo()
      ) : (
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label htmlFor="email"><strong>Email:</strong></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Only show 'Verified' checkbox if the user is not already verified */}
          {!user.verified && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="verified"
                  checked={formData.verified}
                  onChange={handleChange}
                />
                <strong>Verified</strong>
              </label>
            </div>
          )}

          {/* Show 'Suspicious' checkbox only if the user being edited is a cashier */}
          {user.role === 'cashier' && (
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="suspicious"
                  checked={(formData as any).suspicious}
                  onChange={handleChange}
                />
                <strong>Suspicious</strong>
              </label>
            </div>
          )}

          {(currentUserRole === 'manager' || currentUserRole === 'superuser') && (
            <div className="form-group">
              <label htmlFor="role"><strong>Role:</strong></label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                {currentUserRole === 'superuser' ? (
                  <>
                    <option value="regular">regular</option>
                    <option value="cashier">cashier</option>
                    <option value="manager">manager</option>
                    <option value="superuser">superuser</option>
                  </>
                ) : (
                  <>
                    <option value="regular">regular</option>
                    <option value="cashier">cashier</option>
                  </>
                )}
              </select>
            </div>
          )}

          <div className="action-buttons">
            <button type="submit" className="detail-button primary-button">Save Changes</button>
            <button type="button" onClick={handleCancel} className="detail-button secondary-button">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserDetailPage;
