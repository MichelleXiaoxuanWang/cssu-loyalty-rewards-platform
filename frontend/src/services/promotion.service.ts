import { apiCall } from '../utils/api.utils';

export interface Promotion {
  id: number;
  name: string;
  description: string;
  type: string;
  startTime: string;
  endTime: string;
  minSpending?: number;
  rate?: number;
  points?: number;
}

export interface PromotionResponse {
  count: number;
  results: Promotion[];
}

export interface PromotionFilters {
  name?: string;
  type?: string;
  started?: boolean;
  ended?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export const fetchPromotions = async (filters?: PromotionFilters): Promise<PromotionResponse> => {
  return apiCall(`/promotions`, 'GET', filters);
};

export const updatePromotion = async (promotionId: number, promotionData: Record<string, any>) => {
  return apiCall(`/promotions/${promotionId}`, 'PUT', promotionData);
};

export const createPromotion = async (promotionData: Record<string, any>) => {
  return apiCall(`/promotions`, 'POST', promotionData);
};