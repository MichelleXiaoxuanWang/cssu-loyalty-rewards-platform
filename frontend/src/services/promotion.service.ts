import { apiCall } from '../utils/api.utils';

export const fetchPromotions = async (page: number, filters: Record<string, any>, sort: string, limit?: number) => {
  return apiCall(`/promotions`, 'GET', { page, ...filters, sort, limit });
};

export const updatePromotion = async (promotionId: number, promotionData: Record<string, any>) => {
  return apiCall(`/promotions/${promotionId}`, 'PUT', promotionData);
};

export const createPromotion = async (promotionData: Record<string, any>) => {
  return apiCall(`/promotions`, 'POST', promotionData);
};