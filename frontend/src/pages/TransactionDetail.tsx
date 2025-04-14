// src/pages/TransactionDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.config';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import './TransactionDetail.css';

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
  const isRegularUser = currentUserRole === 'regular';

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

  // Check if a redemption is processed (has relatedId)
  const isRedemptionProcessed = () => {
    return transaction?.type === 'redemption' && 
           transaction?.relatedId !== undefined && 
           transaction?.relatedId !== null;
  };

  // Generate QR code data for unprocessed redemptions
  const generateQRCodeData = () => {
    if (!transaction) return "";
    return JSON.stringify({
      id: transaction.id,
      utorid: transaction.utorid,
      type: transaction.type,
      amount: transaction.amount,
      timestamp: new Date().getTime()
    });
  };

  // Should show QR code only for regular users viewing their own unprocessed redemption
  const shouldShowQRCode = () => {
    return isRegularUser && 
           transaction?.type === 'redemption' && 
           !isRedemptionProcessed();
  };

  if (loading) return <p>Loading transaction details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!transaction) return <p>No transaction found.</p>;

  return (
    <div className={`transaction-detail-container ${shouldShowQRCode() ? 'with-qr-code' : ''}`}>
      <div className="transaction-info-section">
        <h2>Transaction Details (ID: {transaction.id})</h2>
        
        {transaction.suspicious && (
          <div className="suspicious-badge">
            <span>⚠️ This transaction has been flagged as suspicious</span>
          </div>
        )}
        
        <div className="detail-row">
          <strong>UTORid:</strong> {transaction.utorid}
        </div>
        
        <div className="detail-row">
          <strong>Type:</strong> {transaction.type}
          {transaction.type === 'redemption' && (
            <span className={`status-tag ${isRedemptionProcessed() ? 'processed-tag' : 'unprocessed-tag'}`}>
              {isRedemptionProcessed() ? 'Processed' : 'Pending'}
            </span>
          )}
        </div>
        
        {transaction.spent !== undefined && (
          <div className="detail-row">
            <strong>Spent:</strong> ${transaction.spent}
          </div>
        )}
        
        <div className="detail-row">
          <strong>Amount:</strong> {transaction.amount} points
        </div>
        
        <div className="detail-row">
          <strong>Suspicious:</strong> {transaction.suspicious ? 'Yes' : 'No'}
        </div>
        
        <div className="detail-row">
          <strong>Remark:</strong> {transaction.remark || 'None'}
        </div>
        
        <div className="detail-row">
          <strong>Created By:</strong> {transaction.createdBy}
        </div>
        
        {transaction.relatedId && (
          <div className="detail-row">
            <strong>Related ID:</strong> {transaction.relatedId}
          </div>
        )}
        
        {/* If current user is manager or superuser, allow editing suspicious status */}
        {(currentUserRole === 'manager' || currentUserRole === 'superuser') && (
          <div className="action-section">
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
            <button onClick={handleUpdateSuspicious} className="action-button">
              Update Suspicious Status
            </button>
          </div>
        )}

        {/* If transaction is of type "redemption" and current user's role is cashier or higher, show Process option */}
        {(transaction.type === 'redemption') && !isRedemptionProcessed() &&
          (['cashier', 'manager', 'superuser'].includes(currentUserRole)) && (
          <div className="action-section">
            <h3>Process Redemption</h3>
            <button onClick={handleProcessRedemption} disabled={processing} className="action-button">
              {processing ? 'Processing...' : 'Process Redemption'}
            </button>
          </div>
        )}

        {updateMsg && <p className="update-message">{updateMsg}</p>}
        
        <div className="navigation-links">
          <a href="/transactions">Back to Transactions List</a>
        </div>
      </div>
      
      {/* Show QR code only for regular users viewing their unprocessed redemption */}
      {shouldShowQRCode() && (
        <div className="qr-code-section">
          <h3>Redemption QR Code</h3>
          <p>Show this QR code to a cashier to process your redemption.</p>
          <div className="qr-code-container">
            <QRCode value={generateQRCodeData()} size={200} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetailPage;
