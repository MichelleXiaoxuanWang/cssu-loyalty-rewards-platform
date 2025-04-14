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
  sort?: string;
  organizer?: number;
}

export const fetchEvents = async (filters?: EventFilters): Promise<EventResponse> => {
  console.log('Filters sent to fetchEvents:', filters);
  return apiCall(`/events`, 'GET', filters);
};

export const createEvent = async (eventData: Record<string, any>): Promise<Event> => {
  return apiCall(`/events`, 'POST', eventData);
};

export async function isUserOrganizer(userId: number): Promise<boolean> {
  const response = await apiCall(`/events/is-organizer/${userId}`, 'GET');
  return response.isOrganizer;
}