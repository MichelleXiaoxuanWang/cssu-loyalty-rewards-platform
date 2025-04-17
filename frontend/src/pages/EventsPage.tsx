import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import Form from '../components/Form';
import Pagination from '../components/Pagination';
import FilterAndSort from '../components/FilterAndSort';
import { fetchEvents, createEvent, Event, EventResponse, EventFilters } from '../services/event.service';
import '../styles/ListingPage.css';
import { API_BASE_URL } from '../config/api.config';
import './TransactionPreviewPage.css';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventFilters>({
    page: 1,
    limit: 5
  });

  const currentUser = localStorage.getItem('currentUser');
  const role = localStorage.getItem(`current_role_${currentUser}`);
  const isAdminRole = role === 'manager' || role === 'superuser';
  const [hasUnpublished, setHasUnpublished] = useState(false);

  useEffect(() => {
      if (isAdminRole) {
        checkSystemAlerts();
      }
    }, [isAdminRole]);
  
    const checkSystemAlerts = async () => {
      try {
        // Get first page with high limit to efficiently check for alerts
        const alertCheckFilters: EventFilters = { 
          page: 1, 
          limit: 100, 
          published: false 
        };
        
        // Check for suspicious transactions
        const unpublishedCheck: EventResponse = await fetchEvents(alertCheckFilters);
        setHasUnpublished(unpublishedCheck.count > 0);
      } catch (err) {
        console.error('Error checking system alerts:', err);
      }
    };
  
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
      setFilters((prevFilters) => ({ ...prevFilters, published: true }));
    }
  }, [role]);

  const handleCreate = () => {
    setCreatingEvent(true);
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      let newEvent: Event;
      if (creatingEvent) {
        const created = await createEvent(formData);
  
        // Add default/fallback values to ensure consistency
        newEvent = {
          ...created,
          numGuests: created.numGuests ?? 0,
          published: created.published ?? false,
          location: created.location ?? 'N/A',
          startTime: created.startTime ?? '',
          endTime: created.endTime ?? '',
          capacity: created.capacity ?? undefined,
        };
  
        setCreatingEvent(false);
  
        if (events.length >= itemsPerPage) {
          setCurrentPage((prevPage) => prevPage + 1);
          setFilters((prevFilters) => ({ ...prevFilters, page: currentPage + 1 }));
          setEvents([newEvent]);
        } else {
          setEvents((prevEvents) => [...prevEvents, newEvent]);
        }
  
        setTotalEvents((prevTotal) => prevTotal + 1);
      }
      setFeedbackMessage('Submission successful!');
    } catch (error: any) {
      alert(error.message);
      setFeedbackMessage('Submission failed. Please try again.');
    }
  };
  

  const handleFilterChange = (newFilters: EventFilters) => {
    setFilters({ ...newFilters, page: 1, limit: itemsPerPage });
  };

  const handleSortChange = (sort: string) => {
    setFilters(prev => ({ ...prev, sort }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setFilters(prev => ({ ...prev, page: 1, limit: newLimit }));
  };

  const handleDelete = async (eventId: number) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const token = localStorage.getItem(`token_${currentUser}`);
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
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

  const totalPages = Math.ceil(totalEvents / itemsPerPage);

  const filterOptions = [
    { label: 'Name', value: 'name' },
    { label: 'Location', value: 'location' },
    { label: 'Started', value: 'started', options: ['true', 'false'] },
    { label: 'Ended', value: 'ended', options: ['true', 'false'] },
  ];

  if (role !== 'regular') {
    filterOptions.push({ label: 'Published', value: 'published', options: ['true', 'false'] });
  }

  return (
    <div className="listing-page">
      <h1>Events</h1>
      {feedbackMessage && <p style={{ color: feedbackMessage.includes('failed') ? 'red' : 'green' }}>{feedbackMessage}</p>}
      {role !== 'regular' && role !== 'cashier' && (
        <button className="listing-create-button" onClick={handleCreate}>+ Create New Event</button>
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

      {isAdminRole && (
        <div className="transactions-alerts">
          {hasUnpublished && (
            <div className="pending-redemptions-alert">
              🔔 Some events are unpublished
            </div>
          )}
        </div>
      )}

      {events && events.length === 0 ? (
        <div className="no-entries">
          <p>No events available</p>
        </div>
      ) : (
        events?.map((event) => (
          <div key={event.id} style={{ position: 'relative' }}>
            <ItemBox
              title={`${event.name}`}
              description={`${event.published ? 'Published' : 'Not Published'}`}
              navigateTo={`/events/${event.id}`}
              id={event.id}
              extraInfo={[
                { label: 'Location', value: event.location },
                { label: 'Start Time', value: event.startTime ? new Date(event.startTime).toLocaleDateString() : 'N/A' },
                { label: 'End Time', value: event.endTime ? new Date(event.endTime).toLocaleDateString() : 'N/A' },
                event.capacity !== null
                  ? { label: 'Capacity', value: event.capacity }
                  : { label: 'Capacity', value: 'Unlimited' },
                event.numGuests !== undefined ? { label: 'Guests', value: event.numGuests } : null
              ].filter(Boolean) as { label: string; value: string | number }[]}
            />
            {(role === 'manager' || role === 'superuser') && (
              <button
                onClick={() => handleDelete(event.id)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  color: '#dc3545',
                  lineHeight: 1
                }}
                title="Delete"
              >
                ×
              </button>
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
        totalItems={totalEvents}
      />
    </div>
  );
};

export default EventsPage;
