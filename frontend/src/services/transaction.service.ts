import { apiCall } from '../utils/api.utils';

type TransferTransactionData = {
    userId: string;
    amount: number;
    remark?: string;
};

type RedeemTransactionData = {
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

const transferPoints = async (userId: string, transactionData: TransferTransactionData) => {
  return apiCall(`/users/${userId}/transactions`, 'POST', { transactionData });
};

const redeemPoints = async (transactionData: RedeemTransactionData) => {
  return apiCall('/users/me/transactions', 'POST', { transactionData });
};

const purchaseTransaction = async (transactionData: PurchaseTransactionData) => {
  return apiCall('/transactions', 'POST', transactionData);
};

const adjustmentTransaction = async (transactionData: AdjustmentTransactionData) => {
  return apiCall('/transactions', 'POST', transactionData);
};

export { transferPoints, redeemPoints, purchaseTransaction, adjustmentTransaction };