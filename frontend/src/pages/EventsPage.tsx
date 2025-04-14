import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import Form from '../components/Form';
import Pagination from '../components/Pagination';
import FilterAndSort from '../components/FilterAndSort';
import { fetchEvents, updateEvent, createEvent } from '../services/event.service';
import '../App.css';

interface Event {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  capacity: number | null;
  points: number;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const currentUser = localStorage.getItem('currentUser');
  const role = localStorage.getItem(`current_role_${currentUser}`);

  useEffect(() => {
    if (role === 'manager' || role === 'superuser') {
      const loadEvents = async () => {
        try {
          const data = await fetchEvents(currentPage, {}, '');
          setEvents(data.events || []);
          setTotalPages(data.totalPages || 1);
        } catch (error) {
          console.error('Error loading events:', error);
          setEvents([]);
        }
      };
      loadEvents();
    }
  }, [currentPage, role]);

  const handleEdit = (event: any) => {
    setEditingEvent(event);
  };

  const handleCreate = () => {
    setCreatingEvent(true);
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      if (creatingEvent) {
        await createEvent(formData);
        setCreatingEvent(false);
      } else if (editingEvent) {
        await updateEvent(editingEvent.id, formData);
        setEditingEvent(null);
      }
      const data = await fetchEvents(currentPage, {}, '');
      setEvents(data.events);
      setFeedbackMessage('Submission successful!');
    } catch (error) {
      setFeedbackMessage('Submission failed. Please try again.');
    }
  };

  const handleFilterChange = async (filter: { name?: string; location?: string; started?: boolean; ended?: boolean; showFull?: boolean; published?: boolean }) => {
    const data = await fetchEvents(currentPage, filter, '');
    setEvents(data.events);
    setTotalPages(data.totalPages);
  };

  const handleSortChange = async (sort: string) => {
    const data = await fetchEvents(currentPage, {}, sort);
    setEvents(data.events);
    setTotalPages(data.totalPages);
  };

  const handleLimitChange = async (newLimit: number) => {
    const data = await fetchEvents(currentPage, {}, '', newLimit);
    setEvents(data.events);
    setTotalPages(data.totalPages);
  };

  if (role === 'regular' || role === 'cashier') {
    return (
      <div>
        <h1>Events</h1>
        {events && events.length === 0 ? (
          <div className="no-entries">No events available</div>
        ) : (
          events?.map((event) => (
            <ItemBox
              key={event.id}
              title={event.title}
              description={event.description}
              onClick={() => handleEdit(event)}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div>
      <h1>Events</h1>
      {feedbackMessage && <p style={{ color: feedbackMessage.includes('failed') ? 'red' : 'green' }}>{feedbackMessage}</p>}
      <button onClick={handleCreate}>Create New Event</button>
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
        filters={[
          { label: 'Name', value: 'name' },
          { label: 'Location', value: 'location' },
          { label: 'Started', value: 'started', options: ['true', 'false'] },
          { label: 'Ended', value: 'ended', options: ['true', 'false'] },
          { label: 'Published', value: 'published', options: ['true', 'false'] },
        ]}
        sortOptions={[{ label: 'Title', value: 'title' }, { label: 'Date', value: 'date' }]}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        disabled={!Array.isArray(events) || events.length === 0}
      />
      {events && events.length === 0 ? (
        <div className="no-entries">
          <p>No events available</p>
        </div>
      ) : (
        events?.map((event) => (
          <ItemBox
            key={event.id}
            title={event.title}
            description={event.description}
            onClick={() => handleEdit(event)}
          />
        ))
      )}
      {(editingEvent) && (
        <Form
          fields={[
            { name: 'title', label: 'Title', type: 'text', value: editingEvent?.title || '' },
            { name: 'description', label: 'Description', type: 'text', value: editingEvent?.description || '' },
            { name: 'startTime', label: 'Start Time', type: 'datetime-local', value: editingEvent?.startTime || '' },
            { name: 'endTime', label: 'End Time', type: 'datetime-local', value: editingEvent?.endTime || '' },
            { name: 'capacity', label: 'Capacity', type: 'number', value: editingEvent?.capacity || '' },
            { name: 'points', label: 'Points', type: 'number', value: editingEvent?.points || '' },
          ]}
          onSubmit={handleSubmit}
        />
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
};

export default EventsPage;