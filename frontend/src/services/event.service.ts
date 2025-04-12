import { apiCall } from '../utils/api.utils';

export const fetchEvents = async (page: number, filters: Record<string, any>, sort: string, limit?: number) => {
  return apiCall(`/events`, 'GET', { page, ...filters, sort, limit });
};

export const updateEvent = async (eventId: number, eventData: Record<string, any>) => {
  return apiCall(`/events/${eventId}`, 'PUT', eventData);
};

export const createEvent = async (eventData: Record<string, any>) => {
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