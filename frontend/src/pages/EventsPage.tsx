import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import Form from '../components/Form';
import Pagination from '../components/Pagination';
import FilterAndSort from '../components/FilterAndSort';
import { fetchEvents, createEvent, Event, EventResponse, EventFilters } from '../services/event.service';
import '../styles/ListingPage.css';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventFilters>({
      page: 1,
      limit: 5
    });
  const currentUser = localStorage.getItem('currentUser');
  const role = localStorage.getItem(`current_role_${currentUser}`);

  useEffect(() => {
    const loadEvents = async () => {
      // setLoading(true);
      try {
        const response: EventResponse = await fetchEvents(filters);
        
        setEvents(response.results);
        setTotalEvents(response.count);
        setCurrentPage(filters.page || 1);
        setItemsPerPage(filters.limit || 10);
      } catch (err) {
        // setError('Failed to load events. Please try again later.');
        console.error('Error fetching events:', err);
      } finally {
        // setLoading(false);
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
        newEvent = await createEvent(formData);
        setCreatingEvent(false);
        // Check if the current page is full
        if (events.length >= itemsPerPage) {
          // Move to the next page and add the new event there
          setCurrentPage((prevPage) => prevPage + 1);
          setFilters((prevFilters) => ({ ...prevFilters, page: currentPage + 1 }));
          setEvents([newEvent]); // Set the new event as the first item on the new page
        } else {
          // Add the new event to the current page
          setEvents((prevEvents) => [...prevEvents, newEvent]);
        }
        // Update the total events count
        setTotalEvents((prevTotal) => prevTotal + 1);
      }
      setFeedbackMessage('Submission successful!');
    } catch (error: any) {
      alert(error.message);
      setFeedbackMessage('Submission failed. Please try again.');
    }
  };

  const handleFilterChange = async (newFilters: EventFilters) => {
    setFilters({ ...newFilters, page: 1 });
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
      {events && events.length === 0 ? (
        <div className="no-entries">
          <p>No events available</p>
        </div>
      ) : (
        events?.map((event) => (
          <ItemBox
            key={event.id}
            title={`ID: ${event.id} - ${event.name}`}
            description={`${event.published ? 'Published' : 'Not Published'}`}
            navigateTo={`/events/${event.id}`}
          />
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