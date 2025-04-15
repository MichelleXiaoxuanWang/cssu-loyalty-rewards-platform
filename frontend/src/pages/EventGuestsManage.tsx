// src/pages/EventGuestsManagePage.tsx
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.config';

interface Guest {
  id: number;
  utorid: string;
  name: string;
}

interface EventData {
  id: number;
  name: string;
  guests: Guest[];
  capacity: number | null;
  endTime: string; // ISO string
}

const EventGuestsManagePage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form state for adding a guest
  const [utorid, setUtorid] = useState<string>('');
  const [adding, setAdding] = useState<boolean>(false);
  const [updateMsg, setUpdateMsg] = useState<string>('');

  // Get current user's token and currentUser from localStorage
  const currentUser = localStorage.getItem('currentUser');
  const token = currentUser ? localStorage.getItem(`token_${currentUser}`) : '';

  // Fetch event details (only need guests, capacity, and endTime) from the backend
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
          },
          credentials: 'include'
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to fetch event details');
        }
        const data: EventData = await response.json();
        setEventData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, token]);

  // Handler for adding a guest using POST /events/:eventId/guests.
  const handleAddGuest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAdding(true);
    setError(null);
    setUpdateMsg('');

    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/guests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        credentials: 'include',
        body: JSON.stringify({ utorid })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add guest');
      }
      const data = await response.json();
      const newGuest: Guest = data.guestAdded;

      // Append the new guest to the existing eventData.guests list
      setEventData(prev => {
        if (prev) {
          return { ...prev, guests: [...(prev.guests || []), newGuest] };
        }
        return prev;
      });

      setUpdateMsg('Guest added successfully!');
      setUtorid('');
    } catch (err: any) {
      alert("Error adding guest: " + err.message || 'Failed to add guest. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  // Handler for removing a guest using DELETE /events/:eventId/guests/:userId
  const handleRemoveGuest = async (guestId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/guests/${guestId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        credentials: 'include'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove guest');
      }
      // Update the eventData state that get rid of the removed guest
      setEventData(prev => {
        if (prev) {
          return { ...prev, guests: prev.guests?.filter(guest => guest.id !== guestId) || [] };
        }
        return prev;
      });
      setUpdateMsg('Guest removed successfully!');
    } catch (err: any) {
      alert("Error removing guest: " + err.message || 'Failed to remove guest. Please try again.');
    }
  };

  if (loading) return <p>Loading guest management...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!eventData) return <p>No event information available.</p>;

  return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem', border: '1px solid #ddd' }}>
        <h1>Manage Guests for Event: {eventData.name} (ID: {eventData.id})</h1>
        <h3>Current Guests</h3>
        {eventData.guests && eventData.guests.length > 0 ? (
            eventData.guests.map(guest => (
                <div key={guest.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <p style={{ margin: 0 }}>
                    <strong>ID:</strong> {guest.id} | <strong>Name:</strong> {guest.name}
                  </p>
                  <button
                      style={{ marginLeft: '1rem', fontSize: '0.8rem' }}
                      onClick={() => handleRemoveGuest(guest.id)}
                  >
                    Remove
                  </button>
                </div>
            ))
        ) : (
            <p>No guests have RSVPed yet.</p>
        )}

        <h3>Add a Guest</h3>
        <form onSubmit={handleAddGuest}>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="guestUtorid"><strong>UTORid:</strong></label>
            <input
                type="text"
                id="guestUtorid"
                value={utorid}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUtorid(e.target.value)}
                required
                style={{ width: '100%' }}
            />
          </div>
          <button type="submit" disabled={adding}>
            {adding ? 'Adding...' : 'Add Guest'}
          </button>
        </form>

        {updateMsg && <p style={{ color: 'green', marginTop: '1rem' }}>{updateMsg}</p>}
        <button style={{ marginTop: '1rem' }} onClick={() => navigate(`/events/${eventData.id}`)}>
          Back to Event Details
        </button>
      </div>
  );
};

export default EventGuestsManagePage;
