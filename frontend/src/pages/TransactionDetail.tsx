// src/pages/TransactionDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.config';

export interface TransactionDetailData {
  id: number;
  utorid: string;
  userId: number;
  type: string;
  spent?: number;
  amount: number;
  promotionIds: number[];
  suspicious: boolean;
  remark: string;
  createdBy: string;
  // Additional fields for redemption transactions:
  processedBy?: string;
  redeemed?: number;
  relatedId?: number;
  // etc.
}

const TransactionDetailPage: React.FC = () => {
  const { userId, transactionId } = useParams<{ userId: string; transactionId: string }>();
  const navigate = useNavigate();
  
  const [transaction, setTransaction] = useState<TransactionDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateMsg, setUpdateMsg] = useState<string>('');
  const [suspicious, setSuspicious] = useState<boolean>(false);
  
  // For redemption processing state (if needed)
  const [processing, setProcessing] = useState<boolean>(false);
  
  // Retrieve current user info from localStorage
  const currentUser = localStorage.getItem('currentUser');
  const token = currentUser ? localStorage.getItem(`token_${currentUser}`) : '';
  // Get the stored role (e.g., 'regular', 'cashier', 'manager', 'superuser')
  const currentUserRole = currentUser ? localStorage.getItem(`current_role_${currentUser}`) || '' : '';

  // Function to fetch transaction details
  const fetchTransaction = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        credentials: 'include'
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch transaction details');
      }
      const data: TransactionDetailData = await response.json();
      setTransaction(data);
      setSuspicious(data.suspicious);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId, token]);

  // Handler for updating the suspicious flag
  const handleUpdateSuspicious = async () => {
    if (!transaction) return;
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${transaction.id}/suspicious`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        credentials: 'include',
        body: JSON.stringify({ suspicious })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update suspicious status');
      }
      const updated: TransactionDetailData = await response.json();
      setTransaction(updated);
      setUpdateMsg('Suspicious status updated successfully!');
    } catch (err: any) {
      setUpdateMsg(err.message);
    }
  };

  // Handler for processing a redemption transaction
  const handleProcessRedemption = async () => {
    if (!transaction) return;
    try {
      setProcessing(true);
      const response = await fetch(`${API_BASE_URL}/transactions/${transaction.id}/processed`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        credentials: 'include',
        body: JSON.stringify({ processed: true })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process redemption');
      }
      const updated: TransactionDetailData = await response.json();
      setTransaction(updated);
      setUpdateMsg('Redemption transaction processed successfully!');
    } catch (err: any) {
      setUpdateMsg(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <p>Loading transaction details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!transaction) return <p>No transaction found.</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', border: '1px solid #ddd', padding: '1rem' }}>
      <h2>Transaction Details (ID: {transaction.id})</h2>
      <p><strong>UTORid:</strong> {transaction.utorid}</p>
      <p><strong>Type:</strong> {transaction.type}</p>
      {transaction.spent !== undefined && <p><strong>Spent:</strong> ${transaction.spent}</p>}
      <p><strong>Amount:</strong> {transaction.amount}</p>
      <p><strong>Suspicious:</strong> {transaction.suspicious ? 'Yes' : 'No'}</p>
      <p><strong>Remark:</strong> {transaction.remark || 'None'}</p>
      <p><strong>Created By:</strong> {transaction.createdBy}</p>
      {transaction.relatedId && <p><strong>Related ID:</strong> {transaction.relatedId}</p>}
      
      {/* If current user is manager or superuser, allow editing suspicious status */}
      {(currentUserRole === 'manager' || currentUserRole === 'superuser') && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h3>Edit Transaction Suspicious Status</h3>
          <label>
            <input
              type="checkbox"
              checked={suspicious}
              onChange={(e) => setSuspicious(e.target.checked)}
            />
            {' '}Mark as suspicious
          </label>
          <br />
          <button onClick={handleUpdateSuspicious} style={{ marginTop: '0.5rem' }}>
            Update Suspicious Status
          </button>
        </div>
      )}

      {/* If transaction is of type "redemption" and current user's role is cashier or higher, show Process option */}
      {(transaction.type === 'redemption') &&
        (['cashier', 'manager', 'superuser'].includes(currentUserRole)) && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h3>Process Redemption</h3>
          <button onClick={handleProcessRedemption} disabled={processing}>
            {processing ? 'Processing...' : 'Process Redemption'}
          </button>
        </div>
      )}

      {updateMsg && <p style={{ marginTop: '1rem', color: 'green' }}>{updateMsg}</p>}
      
      <p style={{ marginTop: '1rem' }}>
        <a href={`/transactions`}>Back to Transactions List</a>
      </p>
    </div>
  );
};

export default TransactionDetailPage;
