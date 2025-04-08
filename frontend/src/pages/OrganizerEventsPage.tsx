import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import { fetchEvents } from '../services/event.service';

const API_BASE_URL = 'http://localhost:3000';

interface Event {
  id: number;
  title: string;
  description: string;
}

const OrganizerEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await fetchEvents(1, {}, ''); // Fetch events for the organizer
        setEvents(data.events);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    loadEvents();
  }, []);

  const awardPoints = async (eventId: number, userId: string | null, points: number) => {
    try {
      const endpoint = `${API_BASE_URL}/events/${eventId}/transactions`;
      const payload = {
        type: 'event',
        utorid: userId || undefined, // Include only if userId is provided
        amount: points,
        remark: userId ? `Awarded ${points} points to user ${userId}` : `Awarded ${points} points to all participants`,
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Points awarded successfully:', data);
    } catch (error) {
      console.error('Error awarding points:', error);
    }
  };

  return (
    <div>
      <h1>Organizer Events Page</h1>
      {events.map((event) => (
        <ItemBox
          key={event.id}
          title={event.title}
          description={event.description}
          onClick={() => console.log(`Clicked on event ${event.id}`)}
        />
      ))}
      <button onClick={() => awardPoints(1, null, 10)}>Award 10 Points to All Participants</button>
    </div>
  );
};

export default OrganizerEventsPage;