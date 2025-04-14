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

export interface UserResponse {
  count: number;
  results: User[];
}

export interface UserFilters {
  name?: string;
  role?: string;
  verified?: boolean;
  activated?: boolean;
  page?: number;
  limit?: number;
}

export const fetchUsers = async (filters?: UserFilters): Promise<UserResponse> => {
  return apiCall(`/users`, 'GET', filters);
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

