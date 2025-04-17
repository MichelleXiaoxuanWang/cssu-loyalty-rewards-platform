// src/pages/EventDetailPage.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.config';
import '../styles/DetailPages.css';

interface Organizer {
  id: number;
  utorid: string;
  name: string;
}

interface Guest {
  id: number;
  utorid: string;
  name: string;
}

export interface EventData {
  id: number;
  name: string;
  description: string;
  location: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  capacity: number | null;
  // For managers/organizers:
  pointsRemain?: number;
  pointsAwarded?: number;
  published?: boolean;
  organizers: Organizer[];
  guests?: Guest[];
  numGuests?: number; // For regular users only
  pointsAllocated?: number;
}

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateMsg, setUpdateMsg] = useState<string>('');

  // For inline editing: store form data for updating event details
  const [editMode, setEditMode] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    capacity: string; // stored as string for easy handling
    points?: string;  // only managers or superuser can see
    published?: boolean;
  }>({
    name: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    capacity: ''
  });

  // Retrieve current user's information (e.g., UTORid, token, role) from localStorage.
  const currentUser = localStorage.getItem('currentUser');
  const token = currentUser ? localStorage.getItem(`token_${currentUser}`) : '';
  const currentUserRole = currentUser ? localStorage.getItem(`current_role_${currentUser}`) || '' : '';

  // Helper: check if the current user has full access (manager, superuser, or is in organizers)
  const hasFullAccess = (ev: EventData): boolean => {
    if (currentUserRole === 'manager' || currentUserRole === 'superuser') {
      return true;
    }
    if (currentUser && ev.organizers.some(org => org.utorid === currentUser)) {
      return true;
    }
    return false;
  };

  // Fetch the event details on mount.
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch event details');
        }
        const data: EventData = await response.json();
        setEventData(data);

        // Pre-fill the edit form with the existing event data.
        setFormData({
          name: data.name,
          description: data.description,
          location: data.location,
          startTime: data.startTime.substring(0, 16), // e.g., "2025-05-10T09:00"
          endTime: data.endTime.substring(0, 16),
          capacity: data.capacity === null ? '' : String(data.capacity),
          ...(data.pointsRemain !== undefined && {
            points: String(data.pointsRemain + (data.pointsAwarded || 0)),
          }),
          ...(data.published !== undefined && { published: data.published }),
        });
      } catch (err: any) {
        alert(err.message || 'Failed to fetch event details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    if (eventId) {
      fetchEvent();
    }
  }, [eventId, token]);

  // Toggle edit mode
  const handleEditClick = () => {
    setEditMode(true);
    setUpdateMsg('');
  };

  // Cancel editing and restore form data.
  const handleCancel = () => {
    if (eventData) {
      setFormData({
        name: eventData.name,
        description: eventData.description,
        location: eventData.location,
        startTime: eventData.startTime.substring(0, 16),
        endTime: eventData.endTime.substring(0, 16),
        capacity: eventData.capacity === null ? '' : String(eventData.capacity),
        ...(eventData.pointsRemain !== undefined && {
          points: String(eventData.pointsRemain + (eventData.pointsAwarded || 0)),
        }),
        ...(eventData.published !== undefined && { published: eventData.published }),
      });
    }
    setUpdateMsg('');
    setError(null);
    setEditMode(false);
  };

  // Handle form field changes.
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle update submission using PATCH.
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!eventData) return;
    setError(null);
    setUpdateMsg('');

    const updates: Record<string, any> = {};
    if (formData.name !== eventData.name) updates.name = formData.name;
    if (formData.description !== eventData.description) updates.description = formData.description;
    if (formData.location !== eventData.location) updates.location = formData.location;

    const originalStartTime = eventData.startTime.substring(0, 16);
    const originalEndTime = eventData.endTime.substring(0, 16);
    if (formData.startTime !== originalStartTime) {
      updates.startTime = new Date(formData.startTime).toISOString();
    }
    if (formData.endTime !== originalEndTime) {
      updates.endTime = new Date(formData.endTime).toISOString();
    }
    const eventCapacityStr = eventData.capacity === null ? '' : String(eventData.capacity);
    if (formData.capacity !== eventCapacityStr) {
      updates.capacity = formData.capacity === '' ? null : Number(formData.capacity);
    }

    // Only managers/superusers may update points and published
    if (currentUserRole === 'manager' || currentUserRole === 'superuser') {
      if (formData.points !== undefined && eventData.pointsRemain !== undefined) {
        const allocated = eventData.pointsRemain + (eventData.pointsAwarded || 0);
        if (Number(formData.points) !== allocated) {
          updates.points = Number(formData.points);
        }
      }
      if (formData.published !== eventData.published && formData.published === true) {
        updates.published = true;
      }
    }

    if (Object.keys(updates).length === 0) {
      setEditMode(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventData.id}`, {
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
        throw new Error(data.error || 'Failed to update event');
      }
      const updatedFields: Partial<EventData> = await response.json();
      setEventData(prev => (prev ? { ...prev, ...updatedFields } : prev));
      setUpdateMsg('Event updated successfully!');
      setEditMode(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update event. Please try again.');
      // Keep the user in edit mode when update fails
      setEditMode(true);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/guests/me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to register for event');
      }

      const updatedEvent = await response.json();
      setEventData(prev => prev ? { ...prev, numGuests: updatedEvent.numGuests } : prev);
      alert('Successfully registered for the event!');
    } catch (err: any) {
      alert("Error registering for event: " + err.message || 'Failed to register for event. Please try again.');
    }
  };

  if (loading) return <p>Loading event details...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;
  if (!eventData) return <p>No event information available.</p>;

  const fullAccess = hasFullAccess(eventData);

  return (
    <div className="detail-page-container">
      <h1>Event Details (ID: {eventData.id})</h1>

      {fullAccess && (
        <div className="action-buttons">
          <button onClick={handleEditClick} className="detail-button primary-button">
            Edit Event Details
          </button>
          <button onClick={() => navigate(`/events/${eventData.id}/transactions`)} className="detail-button tertiary-button">
            Add Event Transaction
          </button>
        </div>
      )}

      {/* Display mode */}
      {!editMode ? (
        <div className="detail-content">
          <div className="detail-field">
            <strong>Name:</strong>
            <span>{eventData.name}</span>
          </div>
          <div className="detail-field">
            <strong>Description:</strong>
            <span>{eventData.description}</span>
          </div>
          <div className="detail-field">
            <strong>Location:</strong>
            <span>{eventData.location}</span>
          </div>
          <div className="detail-field">
            <strong>Start Time:</strong>
            <span>{new Date(eventData.startTime).toLocaleString()}</span>
          </div>
          <div className="detail-field">
            <strong>End Time:</strong>
            <span>{new Date(eventData.endTime).toLocaleString()}</span>
          </div>
          <div className="detail-field">
            <strong>Capacity:</strong>
            <span>{eventData.capacity !== null ? eventData.capacity : 'Unlimited'}</span>
          </div>

          {fullAccess ? (
            <>
              <div className="detail-field">
                <strong>Points Remain:</strong>
                <span>{eventData.pointsRemain}</span>
              </div>
              <div className="detail-field">
                <strong>Points Awarded:</strong>
                <span>{eventData.pointsAwarded}</span>
              </div>
              <div className="detail-field">
                <strong>Published:</strong>
                <span>
                  {eventData.published ? 
                    <span className="status-indicator status-positive">Yes</span> : 
                    <span className="status-indicator status-negative">No</span>}
                </span>
              </div>

              <div className="detail-section">
                <h3>Organizers</h3>
                <div className="list-group">
                  {eventData.organizers.map(org => (
                    <div key={org.id} className="list-item">
                      <strong>ID:</strong> {org.id} | <strong>Name:</strong> {org.name}
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h3>Guests</h3>
                <div className="list-group">
                  {eventData.guests && eventData.guests.length > 0 ? (
                    eventData.guests.map(guest => (
                      <div key={guest.id} className="list-item">
                        <strong>ID:</strong> {guest.id} | <strong>Name:</strong> {guest.name}
                      </div>
                    ))
                  ) : (
                    <p>No guests yet.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="detail-field">
              <strong>Number of Guests:</strong>
              <span>{eventData.numGuests}</span>
            </div>
          )}

          <div className="action-buttons">
            <button onClick={() => navigate('/events')} className="detail-button secondary-button">
              Back to Events List
            </button>
            {(currentUserRole === 'manager' || currentUserRole === 'superuser' || 
              (eventData.organizers.some(org => org.utorid === currentUser))) && (
              <button
                onClick={() => navigate(`/events/${eventData.id}/organizers`)}
                className="detail-button primary-button"
              >
                Manage Organizers
              </button>
            )}
            
            {(currentUserRole === 'manager' || currentUserRole === 'superuser' || 
              (eventData.organizers.some(org => org.utorid === currentUser))) ? (
              <button onClick={() => navigate(`/events/${eventId}/guests-manage`)} className="detail-button primary-button">
                Manage Guests
              </button>
            ) : (
              <button onClick={handleRegister} className="detail-button primary-button">
                Register to this Event
              </button>
            )}
          </div>
          
          {updateMsg && <p className="success-message">{updateMsg}</p>}
        </div>
      ) : (
        // Edit form
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-group">
            <label><strong>Name:</strong></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
            />
          </div>
          
          <div className="form-group">
            <label><strong>Description:</strong></label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleFormChange}
            />
          </div>
          
          <div className="form-group">
            <label><strong>Location:</strong></label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleFormChange}
            />
          </div>
          
          <div className="form-group">
            <label><strong>Start Time:</strong></label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleFormChange}
            />
          </div>
          
          <div className="form-group">
            <label><strong>End Time:</strong></label>
            <input
              type="datetime-local"
              name="endTime"
              value={formData.endTime}
              onChange={handleFormChange}
            />
          </div>
          
          <div className="form-group">
            <label><strong>Capacity:</strong></label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleFormChange}
              placeholder="Leave blank for unlimited"
            />
          </div>
          
          {(currentUserRole === 'manager' || currentUserRole === 'superuser') && (
            <>
              <div className="form-group">
                <label><strong>Total Points Allocated:</strong></label>
                <input
                  type="number"
                  name="points"
                  value={formData.points || ''}
                  onChange={handleFormChange}
                />
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="published"
                    checked={!!formData.published}
                    onChange={(e) =>
                      setFormData({ ...formData, published: e.target.checked })
                    }
                  />
                  <strong>Published</strong>
                </label>
              </div>
            </>
          )}
          
          <div className="action-buttons">
            <button type="submit" className="detail-button primary-button">Save Changes</button>
            <button type="button" onClick={handleCancel} className="detail-button secondary-button">Cancel</button>
          </div>
          
          {error && <p className="error-message">{error}</p>}
          {updateMsg && <p className="success-message">{updateMsg}</p>}
        </form>
      )}
    </div>
  );
};

export default EventDetailPage;
