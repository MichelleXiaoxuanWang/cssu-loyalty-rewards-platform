import { apiCall } from '../utils/api.utils';

export interface EventStatistics {
  total: number;
  ongoing: number;
  upcoming: number;
  ended: number;
}

export interface PromotionStatistics {
  total: number;
  ongoing: number;
  automatic: number;
  oneTime: number;
}

export interface UserStatistics {
  total: number;
  regular: number;
  cashier: number;
  manager: number;
  superuser: number;
}

/**
 * Get event statistics 
 * @returns Promise with event statistics
 */
export const getEventStatistics = async (): Promise<EventStatistics> => {
  try {
    return await apiCall<EventStatistics>('/events/statistics');
  } catch (error) {
    console.error('Error fetching event statistics:', error);
    throw error;
  }
};

/**
 * Get promotion statistics
 * @returns Promise with promotion statistics
 */
export const getPromotionStatistics = async (): Promise<PromotionStatistics> => {
  try {
    return await apiCall<PromotionStatistics>('/promotions/statistics');
  } catch (error) {
    console.error('Error fetching promotion statistics:', error);
    throw error;
  }
};

/**
 * Get user statistics
 * @returns Promise with user statistics
 */
export const getUserStatistics = async (): Promise<UserStatistics> => {
  try {
    return await apiCall<UserStatistics>('/users/statistics');
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    throw error;
  }
};

/**
 * Get all statistics for admin dashboard
 * @returns Promise with combined statistics
 */
export const getAllStatistics = async (): Promise<{
  events: EventStatistics;
  promotions: PromotionStatistics;
  users: UserStatistics;
}> => {
  try {
    const [events, promotions, users] = await Promise.all([
      getEventStatistics(),
      getPromotionStatistics(),
      getUserStatistics()
    ]);

    return {
      events,
      promotions,
      users
    };
  } catch (error) {
    console.error('Error fetching all statistics:', error);
    throw error;
  }
}; 