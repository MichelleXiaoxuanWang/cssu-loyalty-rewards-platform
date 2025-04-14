// src/pages/UserDetailPage.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.config';

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
  const { userId } = useParams<{ userId: string }>(); // route: /users/:userId
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
        setError(err.message);
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
      setError(err.message);
    }
  };

  if (loading) return <p>Loading user details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!user) return <p>No user information available.</p>;

  // Render based on the current user's role.
  // For cashiers: limited information, including UTORid, Name, Points, Verified, and Promotions.
  const renderUserInfo = () => {
    if (currentUserRole === 'cashier') {
      return (
        <div>
        <p><strong>Id:</strong> {user.id}</p>
          <p><strong>UTORid:</strong> {user.utorid}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Points:</strong> {user.points}</p>
          <p><strong>Verified:</strong> {user.verified ? 'Yes' : 'No'}</p>
          {user.promotions && user.promotions.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3>Available Promotions</h3>
              {user.promotions.map((promo, idx) => (
                <div key={idx}>
                  <p>
                    <strong>ID:</strong> {promo.id} | <strong>Name:</strong> {promo.name}
                  </p>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => navigate(`/${user.utorid}/transactions`)} style={{ marginTop: '1rem' }}>
            Back to Transactions List
          </button>
        </div>
      );
    } else {
      // For managers or superusers: display full details
      return (
        <div>
           <p><strong>Id:</strong> {user.id}</p>
          <p><strong>UTORid:</strong> {user.utorid}</p>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {user.birthday && <p><strong>Birthday:</strong> {user.birthday}</p>}
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Points:</strong> {user.points}</p>
          {user.createdAt && <p><strong>Created At:</strong> {new Date(user.createdAt).toLocaleString()}</p>}
          {user.lastLogin && <p><strong>Last Login:</strong> {new Date(user.lastLogin).toLocaleString()}</p>}
          <p><strong>Verified:</strong> {user.verified ? 'Yes' : 'No'}</p>
          <div>
            {user.avatarUrl && <img src={user.avatarUrl} alt="Avatar" style={{ width: '150px' }} />}
          </div>
          {user.promotions && user.promotions.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h3>Available Promotions</h3>
              {user.promotions.map((promo, idx) => (
                <div key={idx}>
                  <p>
                    <strong>ID:</strong> {promo.id} | <strong>Name:</strong> {promo.name}
                  </p>
                </div>
              ))}
            </div>
          )}
          {(currentUserRole === 'manager' || currentUserRole === 'superuser') && (
            <button onClick={handleEditClick} style={{ marginTop: '1rem' }}>
              Edit User Details
            </button>
          )}
        </div>
      );
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', border: '1px solid #ddd' }}>
      <h1>User Details</h1>
      {!editMode ? (
        renderUserInfo()
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email"><strong>Email:</strong></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%' }}
            />
          </div>
          {/* Only managers/superusers have full access to these fields */}
          <div style={{ marginBottom: '1rem' }}>
            <label>
              <strong>Verified:</strong>
              <input
                type="checkbox"
                name="verified"
                checked={formData.verified}
                onChange={handleChange}
                style={{ marginLeft: '1rem' }}
              />
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>
              <strong>Suspicious:</strong>
              <input
                type="checkbox"
                name="suspicious"
                checked={(formData as any).suspicious}
                onChange={handleChange}
                style={{ marginLeft: '1rem' }}
              />
            </label>
          </div>
          {(currentUserRole === 'manager' || currentUserRole === 'superuser') && (
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="role"><strong>Role:</strong></label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{ marginLeft: '1rem' }}
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
          <button type="submit" style={{ marginRight: '1rem' }}>Save Changes</button>
          <button type="button" onClick={handleCancel}>Cancel</button>
        </form>
      )}
    </div>
  );
};

export default UserDetailPage;
