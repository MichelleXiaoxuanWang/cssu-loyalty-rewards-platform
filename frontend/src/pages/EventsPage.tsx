import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import Form from '../components/Form';
import Pagination from '../components/Pagination';
import FilterAndSort from '../components/FilterAndSort';
import { fetchEvents, updateEvent, createEvent } from '../services/event.service';

interface Event {
  id: number;
  title: string;
  description: string;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadEvents = async () => {
      const data = await fetchEvents(currentPage, {}, '');
      setEvents(data.events);
      setTotalPages(data.totalPages);
    };
    loadEvents();
  }, [currentPage]);

  const handleEdit = (event: any) => {
    setEditingEvent(event);
  };

  const handleCreate = () => {
    setCreatingEvent(true);
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    if (creatingEvent) {
      await createEvent(formData);
      setCreatingEvent(false);
    } else if (editingEvent) {
      await updateEvent(editingEvent.id, formData);
      setEditingEvent(null);
    }
    const data = await fetchEvents(currentPage, {}, '');
    setEvents(data.events);
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

  return (
    <div>
      <h1>Events Page</h1>
      <button onClick={handleCreate}>Create New Event</button>
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
      />
      {events.length === 0 ? (
        <div style={{ margin: '20px 0' }}>
          <p>There are currently no entries</p>
        </div>
      ) : (
        events.map((event) => (
          <ItemBox
            key={event.id}
            title={event.title}
            description={event.description}
            onClick={() => handleEdit(event)}
          />
        ))
      )}
      {(editingEvent || creatingEvent) && (
        <Form
          fields={[
            { name: 'title', label: 'Title', type: 'text', value: editingEvent?.title || '' },
            { name: 'description', label: 'Description', type: 'text', value: editingEvent?.description || '' },
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