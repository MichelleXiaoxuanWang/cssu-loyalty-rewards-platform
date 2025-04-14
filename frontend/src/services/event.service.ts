import { apiCall } from '../utils/api.utils';

export interface Event {
  id: number;
  name: string;
  description: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  capacity?: number;
  numGuests?: number;
  points?: number;
}

export interface EventResponse {
  count: number;
  results: Event[];
}

export interface EventFilters {
  name?: string;
  location?: string;
  started?: boolean;
  ended?: boolean;
  showFull?: boolean;
  page?: number;
  limit?: number;
}

export const fetchEvents = async (filters?: EventFilters): Promise<EventResponse> => {
  return apiCall(`/events`, 'GET', filters);
};

export const updateEvent = async (eventId: number, eventData: Record<string, any>) => {
  return apiCall(`/events/${eventId}`, 'PUT', eventData);
};

export const createEvent = async (eventData: Record<string, any>): Promise<Event> => {
  return apiCall(`/events`, 'POST', eventData);
};

export async function isUserOrganizer(userId: number): Promise<boolean> {
  const response = await fetch(`/api/events/is-organizer/${userId}`);
  if (!response.ok) {
    throw new Error('Failed to check organizer status');
  }
  const data = await response.json();
  return data.isOrganizer;
}