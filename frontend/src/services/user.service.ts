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
  sort?: string;
}

export const fetchUsers = async (filters?: UserFilters): Promise<UserResponse> => {
  return apiCall(`/users`, 'GET', filters);
};
