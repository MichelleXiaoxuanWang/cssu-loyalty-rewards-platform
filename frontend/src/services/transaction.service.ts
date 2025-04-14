import { apiCall } from '../utils/api.utils';

// Transaction response interfaces
export interface Transaction {
  id: number;
  utorid?: string;
  type: 'purchase' | 'redemption' | 'adjustment' | 'transfer' | 'event';
  amount: number;
  spent?: number;
  relatedId?: number; // Will be populated with the processor's user ID when a redemption is processed
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

// Function for processing redemption transactions
const processRedemptionTransaction = async (transactionId: number): Promise<Transaction> => {
  return apiCall(`/transactions/${transactionId}/processed`, 'PATCH', { processed: true });
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