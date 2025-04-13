import { apiCall } from '../utils/api.utils';

// Transaction response interfaces
export interface Transaction {
  id: number;
  utorid?: string;
  type: 'purchase' | 'redemption' | 'adjustment' | 'transfer' | 'event';
  amount: number;
  spent?: number;
  relatedId?: number;
  promotionIds: number[];
  suspicious?: boolean;
  remark?: string;
  createdBy: string;
  createdAt?: string;
  redeemed?: number;
  processed?: boolean;
}

export interface TransactionFilters {
  type?: string;
  relatedId?: number;
  promotionId?: number;
  amount?: number;
  operator?: 'gte' | 'lte';
  page?: number;
  limit?: number;
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

// Fields for adjustment transaction
type AdjustmentTransactionData = {
  utorid: string;
  type: string;
  amount: number;
  relatedId: number;
  promotionIds?: number[];
  remark?: string;
};

// Functions for creating transactions
const transferPoints = async (userId: string, transactionData: TransferTransactionData) => {
  return apiCall(`/users/${userId}/transactions`, 'POST', transactionData );
};

const redeemPoints = async (transactionData: RedeemTransactionData) => {
  return apiCall('/users/me/transactions', 'POST', transactionData);
};

const purchaseTransaction = async (transactionData: PurchaseTransactionData) => {
  return apiCall('/transactions', 'POST', transactionData);
};

const adjustmentTransaction = async (transactionData: AdjustmentTransactionData) => {
  return apiCall('/transactions', 'POST', transactionData);
};

// Functions for retrieving transactions
const getMyTransactions = async (filters?: TransactionFilters): Promise<TransactionResponse> => {
  return apiCall('/users/me/transactions', 'GET', filters);
};

const getAllTransactions = async (filters?: TransactionFilters): Promise<TransactionResponse> => {
  return apiCall('/transactions', 'GET', filters);
};

const getTransactionById = async (id: number): Promise<Transaction> => {
  return apiCall(`/transactions/${id}`, 'GET');
};

export { 
  transferPoints, 
  redeemPoints, 
  purchaseTransaction, 
  adjustmentTransaction,
  getMyTransactions,
  getAllTransactions,
  getTransactionById
};