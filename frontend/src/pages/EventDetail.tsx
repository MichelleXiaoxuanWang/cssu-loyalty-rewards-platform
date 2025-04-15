// src/pages/EventDetailPage.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.config';

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
  const currentUserRole = currentUser ? localStorage.getItem(`role_${currentUser}`) || '' : '';

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

  if (loading) return <p>Loading event details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!eventData) return <p>No event information available.</p>;

  const fullAccess = hasFullAccess(eventData);

  return (
      <div className='profile-container'>
        <h1>Event Details (ID: {eventData.id})</h1>

        {/* two bottons here */}
        {fullAccess && (
            <div style={{ marginBottom: '1rem' }}>
              <button onClick={handleEditClick} style={{ marginRight: '1rem' }}>
                Edit Event Details
              </button>
              <button onClick={() => navigate(`/events/${eventData.id}/transactions`)}>
                Add Event Transaction
              </button>
            </div>
        )}

        {/* Display mode */}
        {!editMode ? (
            <div>
              <p><strong>Name:</strong> {eventData.name}</p>
              <p><strong>Description:</strong> {eventData.description}</p>
              <p><strong>Location:</strong> {eventData.location}</p>
              <p>
                <strong>Start Time:</strong> {new Date(eventData.startTime).toLocaleString()}
              </p>
              <p>
                <strong>End Time:</strong> {new Date(eventData.endTime).toLocaleString()}
              </p>
              <p>
                <strong>Capacity:</strong> {eventData.capacity !== null ? eventData.capacity : 'Unlimited'}
              </p>

              {fullAccess ? (
                  <>
                    <p><strong>Points Remain:</strong> {eventData.pointsRemain}</p>
                    <p><strong>Points Awarded:</strong> {eventData.pointsAwarded}</p>
                    <p><strong>Published:</strong> {eventData.published ? 'Yes' : 'No'}</p>
                    <h3>Organizers</h3>
                    {eventData.organizers.map(org => (
                        <p key={org.id}>
                          <strong>ID:</strong> {org.id} | <strong>Name:</strong> {org.name}
                        </p>
                    ))}
                    <h3>Guests</h3>
                    {eventData.guests && eventData.guests.length > 0 ? (
                        eventData.guests.map(guest => (
                            <p key={guest.id}>
                              <strong>ID:</strong> {guest.id} | <strong>Name:</strong> {guest.name}
                            </p>
                        ))
                    ) : (
                        <p>No guests yet.</p>
                    )}
                  </>
              ) : (
                  <p><strong>Number of Guests:</strong> {eventData.numGuests}</p>
              )}

              <div style={{ marginTop: '2rem' }}>
                {fullAccess && (currentUserRole === 'manager' || currentUserRole === 'superuser') && (
                  <button
                      onClick={() => navigate(`/events/${eventData.id}/organizers`)}
                      style={{ marginRight: '1rem' }}
                  >
                    Manage Organizers
                  </button>
                )}
                <button onClick={() => navigate(`/events/${eventId}/guests-manage`)}>Manage Guests</button>
              </div>
              {updateMsg && <p style={{ color: 'green', marginTop: '1rem' }}>{updateMsg}</p>}
            </div>
        ) : (
            // edit form
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
                <label><strong>Location:</strong></label>
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleFormChange}
                    style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label><strong>Start Time:</strong></label>
                <input
                    type="datetime-local"
                    name="startTime"
                    value={formData.startTime}
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
                <label><strong>Capacity:</strong></label>
                <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleFormChange}
                    style={{ width: '100%' }}
                    placeholder="Leave blank for unlimited"
                />
              </div>
              {(currentUserRole === 'manager' || currentUserRole === 'superuser') && (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <label><strong>Total Points Allocated:</strong></label>
                      <input
                          type="number"
                          name="points"
                          value={formData.points || ''}
                          onChange={handleFormChange}
                          style={{ width: '100%' }}
                      />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <label>
                        <strong>Published:</strong>
                        <input
                            type="checkbox"
                            name="published"
                            checked={!!formData.published}
                            onChange={(e) =>
                                setFormData({ ...formData, published: e.target.checked })
                            }
                            style={{ marginLeft: '1rem' }}
                        />
                      </label>
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

export default EventDetailPage;
