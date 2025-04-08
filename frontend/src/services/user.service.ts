import { apiCall } from '../utils/api.utils';

export const fetchUsers = async (page: number, filters: Record<string, any>, sort: string, limit?: number) => {
  return apiCall(`/users`, 'GET', { page, ...filters, sort, limit });
};

export const updateUser = async (userId: number, userData: Record<string, any>) => {
  return apiCall(`/users/${userId}`, 'PUT', userData);
};

export const createUser = async (userData: Record<string, any>) => {
  return apiCall(`/users`, 'POST', userData);
};