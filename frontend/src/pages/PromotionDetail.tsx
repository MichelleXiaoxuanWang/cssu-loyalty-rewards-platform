// src/pages/PromotionDetailPage.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.config';

export interface PromotionData {
  id: number;
  name: string;
  description: string;
  type: string; // "automatic" or "one-time"
  endTime: string; // Always returned (ISO string)
  // Fields below are only returned for Manager or higher clearance
  startTime?: string;
  minSpending?: number;
  rate?: number;
  points: number;
}

const PromotionDetailPage: React.FC = () => {
  const { promotionId } = useParams<{ promotionId: string }>();
  const navigate = useNavigate();

  const [promotion, setPromotion] = useState<PromotionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateMsg, setUpdateMsg] = useState<string>('');
  const [editMode, setEditMode] = useState<boolean>(false);

  // For editing, store the form data.
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    type: string;
    startTime?: string;
    endTime: string;
    minSpending?: string;
    rate?: string;
    points: string;
  }>({
    name: '',
    description: '',
    type: '',
    endTime: '',
    points: '',
  });

  // Retrieve current user info from localStorage
  const currentUser = localStorage.getItem('currentUser');
  const token = currentUser ? localStorage.getItem(`token_${currentUser}`) : '';
  const currentUserRole = currentUser ? localStorage.getItem(`current_role_${currentUser}`) || '' : '';

  // Determine if user is manager or higher
  const isManagerOrHigher = currentUserRole === 'manager' || currentUserRole === 'superuser';

  // Fetch the promotion details when the component mounts.
  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/promotions/${promotionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch promotion details');
        }
        const data: PromotionData = await response.json();
        setPromotion(data);
        // Pre-fill the edit form using the fetched data.
        setFormData({
          name: data.name,
          description: data.description,
          type: data.type,
          endTime: data.endTime.substring(0, 16), // format "YYYY-MM-DDTHH:mm"
          points: String(data.points),
          ...(data.startTime && { startTime: data.startTime.substring(0, 16) }),
          ...(data.minSpending !== undefined ? { minSpending: String(data.minSpending) } : {}),
          ...(data.rate !== undefined ? { rate: String(data.rate) } : {}),
        });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (promotionId) {
      fetchPromotion();
    }
  }, [promotionId, token]);

  // Toggle edit mode.
  const handleEditClick = () => {
    setEditMode(true);
    setUpdateMsg('');
    setError(null);
  };

  // Cancel editing and restore form data.
  const handleCancel = () => {
    if (promotion) {
      setFormData({
        name: promotion.name,
        description: promotion.description,
        type: promotion.type,
        endTime: promotion.endTime.substring(0, 16),
        points: String(promotion.points),
        ...(promotion.startTime && { startTime: promotion.startTime.substring(0, 16) }),
        ...(promotion.minSpending !== undefined ? { minSpending: String(promotion.minSpending) } : {}),
        ...(promotion.rate !== undefined ? { rate: String(promotion.rate) } : {}),
      });
    }
    setUpdateMsg('');
    setError(null);
    setEditMode(false);
  };

  // Handle input changes in the edit form.
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle form submission for updating promotion details.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!promotion) return;
    setError(null);
    setUpdateMsg('');

    const updates: Record<string, any> = {};
    if (formData.name !== promotion.name) updates.name = formData.name;
    if (formData.description !== promotion.description) updates.description = formData.description;
    if (formData.type !== promotion.type) updates.type = formData.type;

    if (isManagerOrHigher) {
      if (formData.startTime && promotion.startTime && formData.startTime !== promotion.startTime.substring(0, 16)) {
        updates.startTime = new Date(formData.startTime).toISOString();
      }
      if (formData.endTime !== promotion.endTime.substring(0, 16)) {
        updates.endTime = new Date(formData.endTime).toISOString();
      }
      if (formData.minSpending !== undefined) {
        if (promotion.minSpending === undefined || formData.minSpending !== String(promotion.minSpending)) {
          updates.minSpending = Number(formData.minSpending);
        }
      }
      if (formData.rate !== undefined) {
        if (promotion.rate === undefined || formData.rate !== String(promotion.rate)) {
          updates.rate = Number(formData.rate);
        }
      }
      if (formData.points !== String(promotion.points)) {
        updates.points = Number(formData.points);
      }
    }

    if (Object.keys(updates).length === 0) {
      setEditMode(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${promotion.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update promotion');
      }
      const updatedFields: Partial<PromotionData> = await response.json();
      setPromotion(prev => (prev ? { ...prev, ...updatedFields } : prev));
      setUpdateMsg('Promotion updated successfully!');
      setEditMode(false);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle deletion of the promotion.
  const handleDelete = async () => {
    if (!promotion) return;
    try {
      const response = await fetch(`${API_BASE_URL}/promotions/${promotion.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token || ''}`,
        },
        credentials: 'include',
      });
      if (response.status === 204) {
        navigate('/promotions');
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete promotion');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading promotion details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!promotion) return <p>No promotion information available.</p>;

  return (
    <div className='profile-container'>
      <h1>Promotion Details (ID: {promotion.id})</h1>
      {!editMode ? (
        <div>
          <p><strong>Name:</strong> {promotion.name}</p>
          <p><strong>Description:</strong> {promotion.description}</p>
          <p><strong>Type:</strong> {promotion.type}</p>
          <p><strong>End Time:</strong> {new Date(promotion.endTime).toLocaleString()}</p>
          <p><strong>Min Spending:</strong> {promotion.minSpending !== undefined ? promotion.minSpending : 'N/A'}</p>
          <p><strong>Rate:</strong> {promotion.rate !== undefined ? promotion.rate : 'N/A'}</p>
          <p><strong>Points:</strong> {promotion.points}</p>
          {isManagerOrHigher && (
            <>
              <p><strong>Start Time:</strong> {promotion.startTime ? new Date(promotion.startTime).toLocaleString() : 'N/A'}</p>
            </>
          )}
          <div style={{ marginTop: '1rem' }}>
            {isManagerOrHigher && (
              <>
                <button onClick={handleEditClick} style={{ marginRight: '1rem' }}>
                  Edit Promotion
                </button>
                <button onClick={handleDelete} style={{ marginRight: '1rem' }}>
                  Delete Promotion
                </button>
              </>
            )}
            <button onClick={() => navigate('/promotions')}>
              Back to Promotions List
            </button>
          </div>
          {updateMsg && <p style={{ color: 'green', marginTop: '1rem' }}>{updateMsg}</p>}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label><strong>Name:</strong></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label><strong>Description:</strong></label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label><strong>Type:</strong></label>
            <select
              name="type"
              value={formData.type}
              onChange={handleFormChange}
              style={{ width: '100%' }}
            >
              <option value="automatic">automatic</option>
              <option value="one-time">one-time</option>
            </select>
          </div>
          {isManagerOrHigher && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label><strong>Start Time:</strong></label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime || ''}
                  onChange={handleFormChange}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label><strong>End Time:</strong></label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleFormChange}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label><strong>Min Spending:</strong></label>
                <input
                  type="number"
                  name="minSpending"
                  value={formData.minSpending || ''}
                  onChange={handleFormChange}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label><strong>Rate:</strong></label>
                <input
                  type="number"
                  step="0.01"
                  name="rate"
                  value={formData.rate || ''}
                  onChange={handleFormChange}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label><strong>Points:</strong></label>
                <input
                  type="number"
                  name="points"
                  value={formData.points || ''}
                  onChange={handleFormChange}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}
          <button type="submit" style={{ marginRight: '1rem' }}>Save Changes</button>
          <button type="button" onClick={handleCancel}>Cancel</button>
          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
          {updateMsg && <p style={{ color: 'green', marginTop: '1rem' }}>{updateMsg}</p>}
        </form>
      )}
    </div>
  );
};

export default PromotionDetailPage;
