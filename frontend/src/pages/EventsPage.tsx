// src/pages/EventsPage.tsx
import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import Form from '../components/Form';
import Pagination from '../components/Pagination';
import FilterAndSort from '../components/FilterAndSort';
import {
  fetchEvents,
  createEvent,
  Event,
  EventResponse,
  EventFilters
} from '../services/event.service';
import { API_BASE_URL } from '../config/api.config';
import '../App.css';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventFilters>({ page: 1, limit: 5 });

  const currentUser = localStorage.getItem('currentUser');
  const role = localStorage.getItem(`current_role_${currentUser}`);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response: EventResponse = await fetchEvents(filters);
        setEvents(response.results);
        setTotalEvents(response.count);
        setCurrentPage(filters.page || 1);
        setItemsPerPage(filters.limit || 10);
      } catch (err) {
        console.error('Error fetching events:', err);
      }
    };
    loadEvents();
  }, [filters]);

  useEffect(() => {
    if (role === 'regular') {
      setFilters(prev => ({ ...prev, published: true }));
    }
  }, [role]);

  const handleCreate = () => setCreatingEvent(true);

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      if (creatingEvent) {
        const newEvent = await createEvent(formData);
        setCreatingEvent(false);
        if (events.length >= itemsPerPage) {
          setCurrentPage(p => p + 1);
          setFilters(prev => ({ ...prev, page: currentPage + 1 }));
          setEvents([newEvent]);
        } else {
          setEvents(prev => [...prev, newEvent]);
        }
        setTotalEvents(prev => prev + 1);
        setFeedbackMessage('Submission successful!');
      }
    } catch {
      setFeedbackMessage('Submission failed. Please try again.');
    }
  };

  const handleFilterChange = (newFilters: EventFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };
  const handleSortChange = (sort: string) => setFilters(prev => ({ ...prev, sort }));
  const handlePageChange = (page: number) => setFilters(prev => ({ ...prev, page }));
  const handleLimitChange = (limit: number) => setFilters(prev => ({ ...prev, page: 1, limit }));

  const totalPages = Math.ceil(totalEvents / itemsPerPage);
  const filterOptions = [
    { label: 'Name', value: 'name' },
    { label: 'Location', value: 'location' },
    { label: 'Started', value: 'started', options: ['true','false'] },
    { label: 'Ended', value: 'ended', options: ['true','false'] },
  ];
  if (role !== 'regular') {
    filterOptions.push({ label: 'Published', value: 'published', options: ['true','false'] });
  }

  const handleDelete = async (eventId: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem(`token_${currentUser}`)}` },
        credentials: 'include'
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete event');
      }
      setEvents(prev => prev.filter(evt => evt.id !== eventId));
      setTotalEvents(prev => prev - 1);
    } catch (err: any) {
      alert(`Error deleting event: ${err.message}`);
    }
  };

  return (
    <div>
      <h1>Events</h1>
      {feedbackMessage && (
        <p style={{ color: feedbackMessage.includes('failed') ? 'red' : 'green' }}>
          {feedbackMessage}
        </p>
      )}
      {role !== 'regular' && role !== 'cashier' && (
        <button onClick={handleCreate}>Create New Event</button>
      )}
      {creatingEvent && (
        <Form
          fields={[
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'description', label: 'Description', type: 'text' },
            { name: 'location', label: 'Location', type: 'text' },
            { name: 'startTime', label: 'Start Time', type: 'datetime-local' },
            { name: 'endTime', label: 'End Time', type: 'datetime-local' },
            { name: 'capacity', label: 'Capacity', type: 'number' },
            { name: 'points', label: 'Points', type: 'number' },
          ]}
          onSubmit={handleSubmit}
        />
      )}
      <FilterAndSort
        filters={filterOptions}
        sortOptions={[
          { label: 'ID (Ascending)', value: 'id-asc' },
          { label: 'ID (Descending)', value: 'id-desc' },
          { label: 'Name (A-Z)', value: 'name-asc' },
          { label: 'Name (Z-A)', value: 'name-desc' },
          { label: 'Start Time (Earliest)', value: 'starttime-asc' },
          { label: 'Start Time (Latest)', value: 'starttime-desc' },
          { label: 'End Time (Earliest)', value: 'endtime-asc' },
          { label: 'End Time (Latest)', value: 'endtime-desc' },
        ]}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />

      {events.length === 0 ? (
        <div className="no-entries">
          <p>No events available</p>
        </div>
      ) : (
        events.map(ev => (
          <div key={ev.id} style={{ position: 'relative' }}>
            {/* Keep the box exactly as before */}
            <ItemBox
              title={`ID: ${ev.id} – ${ev.name}`}
              navigateTo={`/events/${ev.id}`}
            />

            {/* Move published badge to bottom-right */}
            <span
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                fontSize: '0.9rem',
                color: ev.published ? '#28a745' : '#dc3545',
                background: 'rgba(255,255,255,0.9)',
                padding: '2px 6px',
                borderRadius: '4px',
                boxShadow: '0 0 4px rgba(0,0,0,0.1)',
                pointerEvents: 'none'
              }}
            >
              {ev.published ? 'Published' : 'Not Published'}
            </span>

            {/* Delete “×” still top-right */}
            {(role === 'manager' || role === 'superuser') && (
              <span
                onClick={() => handleDelete(ev.id)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: '#dc3545',
                  background: 'white',
                  borderRadius: '50%',
                  lineHeight: '1',
                  width: '24px',
                  height: '24px',
                  textAlign: 'center',
                  boxShadow: '0 0 4px rgba(0,0,0,0.2)'
                }}
                title="Delete"
              >
                ×
              </span>
            )}
          </div>
        ))
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default EventsPage;
