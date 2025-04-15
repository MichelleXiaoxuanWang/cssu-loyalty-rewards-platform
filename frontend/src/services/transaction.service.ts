import { apiCall } from '../utils/api.utils';
import { withErrorHandler } from '../utils/error.utils';

// Transaction response interfaces
export interface Transaction {
  id: number;
  utorid?: string;
  type: 'purchase' | 'redemption' | 'adjustment' | 'transfer' | 'event';
  amount: number;
  spent?: number;
  relatedId?: number; // Will be populated with the processor's user ID when a redemption is processed
  relatedUtorid?: string; // Add this field for transfer and redemption transactions
  promotionIds: number[];
  suspicious?: boolean;
  remark?: string;
  createdBy: string;
  createdAt?: string;
}

export interface TransactionFilters {
  name?: string;
  createdBy?: string;
  type?: string;
  promotionId?: number;
  relatedId?: number;
  amount?: number;
  operator?: string;
  suspicious?: boolean;
  unprocessed?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface TransactionResponse {
  count: number;
  results: Transaction[];
}

// Transaction input data types
type TransferTransactionData = {
    type: string;
    amount: number;
    remark?: string;
};

type RedeemTransactionData = {
    type: string;
    amount: number;
    remark?: string;
};

// Fields for purchase transaction
type PurchaseTransactionData = {
  type: string;
  spent: number;
  promotionIds?: number[];
  remark?: string;
};

export type AdjustmentTransactionData = {
  type: string;
  amount: number;
  remark: string;
  relatedId: number;
  utorid: string;
  promotionIds?: number[];
};

// Functions for creating transactions
const transferPoints = async (userId: string, transactionData: TransferTransactionData) => {
  return withErrorHandler(() => apiCall(`/users/${userId}/transactions`, 'POST', transactionData));
};

const redeemPoints = async (transactionData: RedeemTransactionData) => {
  return withErrorHandler(() => apiCall('/users/me/transactions', 'POST', transactionData));
};

const purchaseTransaction = async (transactionData: PurchaseTransactionData) => {
  return withErrorHandler(() => apiCall('/transactions', 'POST', transactionData));
};

// Function for processing redemption transactions
const processRedemptionTransaction = async (transactionId: number): Promise<Transaction> => {
  const result = await withErrorHandler(() => apiCall(`/transactions/${transactionId}/processed`, 'PATCH', { processed: true }));
  if (!result) {
    throw new Error('Failed to process redemption transaction');
  }
  return result;
};

// Functions for retrieving transactions
const getMyTransactions = async (filters?: TransactionFilters): Promise<TransactionResponse> => {
  const result = await withErrorHandler(async () => {
    const response = await apiCall('/users/me/transactions', 'GET', filters);
    return response;
  });
  if (!result) {
    throw new Error('Failed to fetch transactions');
  }
  return result;
};

const getAllTransactions = async (filters?: TransactionFilters): Promise<TransactionResponse> => {
  const result = await withErrorHandler(async () => {
    const response = await apiCall('/transactions', 'GET', filters);
    return response;
  });
  if (!result) {
    throw new Error('Failed to fetch all transactions');
  }
  return result;
};

const getTransactionById = async (id: number): Promise<Transaction> => {
  const result = await withErrorHandler(async () => {
    const response = await apiCall(`/transactions/${id}`, 'GET');
    return response;
  });
  if (!result) {
    throw new Error('Failed to fetch transaction');
  }
  return result;
};

export const createAdjustmentTransaction = async (transactionData: AdjustmentTransactionData) => {
  return withErrorHandler(() => apiCall('/transactions', 'POST', transactionData));
};

export const SORT_OPTIONS = [
  { label: 'ID (Ascending)', value: 'id-asc' },
  { label: 'ID (Descending)', value: 'id-desc' },
  { label: 'Amount (Low to High)', value: 'amount-asc' },
  { label: 'Amount (High to Low)', value: 'amount-desc' },
  { label: 'Date (Oldest First)', value: 'createdAt-asc' },
  { label: 'Date (Newest First)', value: 'createdAt-desc' },
  { label: 'Type (A-Z)', value: 'type-asc' },
  { label: 'Type (Z-A)', value: 'type-desc' }
];

export { 
  transferPoints, 
  redeemPoints, 
  purchaseTransaction, 
  processRedemptionTransaction,
  getMyTransactions,
  getAllTransactions,
  getTransactionById
};