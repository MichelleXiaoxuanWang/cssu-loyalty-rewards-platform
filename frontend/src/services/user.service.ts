import { apiCall } from '../utils/api.utils';

export interface User {
  id: number;
  utorid: string;
  name: string;
  email: string;
  birthday: string;
  role: string;
  points: number;
  createdAt: string;
  lastLogin: string;
  verified: boolean;
  avatarUrl: string;
  promotions: any[];
}

export const fetchUsers = async (page: number, filters: Record<string, any>, sort: string, limit?: number) => {
  return apiCall(`/users`, 'GET', { page, ...filters, sort, limit });
};

export const updateUser = async (userId: number, userData: Record<string, any>) => {
  return apiCall(`/users/${userId}`, 'PUT', userData);
};

export const createUser = async (userData: Record<string, any>) => {
  return apiCall(`/users`, 'POST', userData);
};

export const getCurrentUser = async (): Promise<User> => {
  return apiCall('/users/me', 'GET');
};