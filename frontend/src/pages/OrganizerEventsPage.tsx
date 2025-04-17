import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import { fetchEvents, Event, EventResponse, EventFilters } from '../services/event.service';
import '../styles/ListingPage.css';
import Pagination from '../components/Pagination';

const OrganizerEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalEvents, setTotalEvents] = useState(0);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const currentUser = localStorage.getItem('currentUser');
  const currentUserId = localStorage.getItem(`userId_${currentUser}`);
  const [filters, setFilters] = useState<EventFilters>({
    page: 1,
    limit: 5,
    organizer: Number(currentUserId),
  });

  useEffect(() => {
    const loadEvents = async () => {
      // setLoading(true);
      // setError(null);
      try {
        const response: EventResponse = await fetchEvents(filters); 
        setEvents(response.results);
        setTotalEvents(response.count);
        setCurrentPage(filters.page || 1);
        setItemsPerPage(filters.limit || 10);
      } catch (err) {
        console.error('Error loading events:', err);
        // setError('Failed to load events.');
      } finally {
        // setLoading(false);
      }
    };
    loadEvents();
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setFilters(prev => ({ ...prev, page: 1, limit: newLimit }));
  };
  
  const totalPages = Math.ceil(totalEvents / itemsPerPage);

  return (
    <div className="listing-page">
      <h1>My Organized Events</h1>
      {events && events.length === 0 ? (
        <div className="no-entries">
          <p>No events available</p>
        </div>
      ) : (
        events?.map((event) => (
          <ItemBox
            key={event.id}
            title={`ID: ${event.id} - Name: ${event.name}`}
            description={`${event.published ? 'Published' : 'Not Published'}`}
            navigateTo={`/events/${event.id}`}
            id={event.id}
            extraInfo={[
              { label: 'Location', value: event.location },
              { label: 'Start Time', value: event.startTime ? new Date(event.startTime).toLocaleDateString() : 'N/A' },
              { label: 'End Time', value: event.endTime ? new Date(event.endTime).toLocaleDateString() : 'N/A' },
              event.capacity !== null ? { label: 'Capacity', value: event.capacity } : { label: 'Capacity', value: 'Unlimited' },
              event.numGuests !== undefined ? { label: 'Guests', value: event.numGuests } : null
            ].filter(Boolean) as {label: string; value: string | number}[]}
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

export default OrganizerEventsPage;