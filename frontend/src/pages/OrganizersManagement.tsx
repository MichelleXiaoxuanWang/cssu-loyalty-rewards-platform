// src/pages/OrganizersManagementPage.tsx
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.config';

interface Organizer {
  id: number;
  utorid: string;
  name: string;
}

interface EventData {
  id: number;
  name: string;
  organizers: Organizer[];
}

const OrganizersManagementPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newOrganizerUtorid, setNewOrganizerUtorid] = useState<string>('');
  const [updateMsg, setUpdateMsg] = useState<string>('');

  // Retrieve current user's token from localStorage
  const currentUser = localStorage.getItem('currentUser');
  const token = currentUser ? localStorage.getItem(`token_${currentUser}`) : '';

  // Fetch event data (including organizers)
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
          throw new Error(data.error || 'Failed to fetch event data');
        }
        const data: EventData = await response.json();
        setEventData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchEvent();
  }, [eventId, token]);

  // Handler for adding a new organizer.
  const handleAddOrganizer = async () => {
    if (newOrganizerUtorid.trim() === '') return;
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/organizers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        credentials: 'include',
        body: JSON.stringify({ utorid: newOrganizerUtorid.trim() })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add organizer');
      }
      const updatedEvent: EventData = await response.json();
      setEventData(updatedEvent);
      setNewOrganizerUtorid('');
      setUpdateMsg('Organizer added successfully!');
    } catch (err: any) {
      alert("Error adding organizer: " + err.message || 'Failed to add organizer. Please try again.');
    }
  };

  // Handler for removing an organizer.
  const handleRemoveOrganizer = async (orgId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/organizers/${orgId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        credentials: 'include'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove organizer');
      }
      // After removal, update the organizers list in state.
      if (eventData) {
        const updatedOrganizers = eventData.organizers.filter(org => org.id !== orgId);
        setEventData({ ...eventData, organizers: updatedOrganizers });
      }
      setUpdateMsg('Organizer removed successfully!');
    } catch (err: any) {
      alert("Error removing organizer: " + err.message || 'Failed to remove organizer. Please try again.');
    }
  };

  if (loading) return <p>Loading event data...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!eventData) return <p>No event data available.</p>;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem', border: '1px solid #ddd' }}>
      <h1>Manage Organizers for Event: {eventData.name} (ID: {eventData.id})</h1>
      <h3>Current Organizers</h3>
      {eventData.organizers.length === 0 ? (
        <p>No organizers currently.</p>
      ) : (
        eventData.organizers.map(org => (
          <div key={org.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span>
              <strong>ID:</strong> {org.id} | <strong>Name:</strong> {org.name}
            </span>
            <button onClick={() => handleRemoveOrganizer(org.id)} style={{ fontSize: '0.8rem' }}>
              Remove
            </button>
          </div>
        ))
      )}
      <div style={{ marginTop: '1rem' }}>
        <input
          type="text"
          placeholder="Enter organizer UTORid"
          value={newOrganizerUtorid}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewOrganizerUtorid(e.target.value)}
          style={{ width: '60%' }}
        />
        <button onClick={handleAddOrganizer} style={{ marginLeft: '0.5rem', fontSize: '0.8rem' }}>
          Add Organizer
        </button>
      </div>
      {updateMsg && <p style={{ color: 'green', marginTop: '1rem' }}>{updateMsg}</p>}
      <button onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>Back</button>
    </div>
  );
};

export default OrganizersManagementPage;
