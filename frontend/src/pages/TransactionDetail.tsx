// src/pages/TransactionDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.config';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import '../styles/DetailPages.css';
import './TransactionDetail.css';
import Form from '../components/Form';
import { AdjustmentTransactionData, createAdjustmentTransaction } from '../services/transaction.service';

export interface TransactionDetailData {
  id: number;
  utorid: string;
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
  const { transactionId } = useParams<{ transactionId: string }>();
  
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

  const [creatingAdjustment, setCreatingAdjustment] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleCreateAdjustmentClick = () => {
    setCreatingAdjustment(true);
    setFeedbackMessage(null);
  };

  const handleAdjustmentSubmit = async (formData: Record<string, any>) => {
    try {
      if (!transaction) return;

      // Validate that either amount or promotionIds is provided
      if (!formData.amount && (!formData.promotionIds || formData.promotionIds.trim() === '')) {
        alert('Please provide either an amount or promotion IDs');
        return;
      }

      // If it's a purchase transaction and amount is empty, ensure promotionIds is provided
      if (transaction.type === 'purchase' && !formData.amount && (!formData.promotionIds || formData.promotionIds.trim() === '')) {
        alert('For purchase transactions, you must provide either an amount or promotion IDs');
        return;
      }

      const requestBody: AdjustmentTransactionData = {
        type: 'adjustment',
        amount: formData.amount ? parseFloat(formData.amount) : 0,
        remark: formData.remark,
        relatedId: transaction.id,
        utorid: transaction.utorid
      };

      // Include promotionIds if provided
      if (formData.promotionIds && formData.promotionIds.trim() !== '') {
        const parsedPromotionIds = formData.promotionIds
          .split(',')
          .map((id: string) => parseInt(id.trim(), 10))
          .filter((id: number) => !isNaN(id));

        if (parsedPromotionIds.length === 0) {
          alert('Please provide valid promotion IDs');
          return;
        }

        requestBody.promotionIds = parsedPromotionIds;
      }

      const result = await createAdjustmentTransaction(requestBody);
      if (!result) {
        throw new Error('Failed to create adjustment transaction');
      }
      
      // Only close window and show success message if the API call was successful
      setCreatingAdjustment(false);
      setFeedbackMessage('Adjustment transaction created successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create adjustment transaction. Please try again.');
      // Don't close the adjustment window or set feedback message on error
    }
  };

  if (loading) return <p>Loading transaction details...</p>;
  if (error) return <p className="error-message">Error: {error}</p>;
  if (!transaction) return <p>No transaction found.</p>;

  return (
    <div className={`detail-page-container ${shouldShowQRCode() ? 'with-qr-code' : ''}`}>
      <h1>Transaction Details (ID: {transaction.id})</h1>
      
      {transaction.suspicious && (
        <div className="alert-banner alert-warning">
          <span>⚠️ This transaction has been flagged as suspicious</span>
        </div>
      )}
      
      <div className="detail-content">
        <div className="detail-field">
          <strong>UTORid:</strong>
          <span>{transaction.utorid}</span>
        </div>
        
        <div className="detail-field">
          <strong>Type:</strong>
          <span>
            {transaction.type}
            {transaction.type === 'redemption' && (
              <div className={`status-tag-detail ${isRedemptionProcessed() ? 'processed-tag-detail' : 'unprocessed-tag-detail'}`}>
                {isRedemptionProcessed() ? 'Processed' : 'Pending'}
              </div>
            )}
          </span>
        </div>
        
        {transaction.spent !== undefined && (
          <div className="detail-field">
            <strong>Spent:</strong>
            <span>${transaction.spent}</span>
          </div>
        )}
        
        <div className="detail-field">
          <strong>Amount:</strong>
          <span>{transaction.amount} points</span>
        </div>
        
        <div className="detail-field">
          <strong>Suspicious:</strong>
          <span>
            {transaction.suspicious ? 
              <span className="status-indicator status-negative">Yes</span> : 
              <span className="status-indicator status-positive">No</span>}
          </span>
        </div>
        
        <div className="detail-field">
          <strong>Remark:</strong>
          <span>{transaction.remark || 'None'}</span>
        </div>
        
        <div className="detail-field">
          <strong>Created By:</strong>
          <span>{transaction.createdBy}</span>
        </div>
        
        {transaction.relatedId && (
          <div className="detail-field">
            <strong>Related ID:</strong>
            <span>{transaction.relatedId}</span>
          </div>
        )}
        
        {/* Manager or superuser editing section */}
        {(currentUserRole === 'manager' || currentUserRole === 'superuser') && (
          <div className="detail-section">
            <h3>Edit Transaction Suspicious Status</h3>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={suspicious}
                  onChange={(e) => setSuspicious(e.target.checked)}
                />
                Mark as suspicious
              </label>
            </div>
            <button onClick={handleUpdateSuspicious} className="detail-button primary-button">
              Update Suspicious Status
            </button>
          </div>
        )}

        {/* Redemption processing section */}
        {(transaction.type === 'redemption') && !isRedemptionProcessed() &&
          (['cashier', 'manager', 'superuser'].includes(currentUserRole)) && (
          <div className="detail-section">
            <h3>Process Redemption</h3>
            <button onClick={handleProcessRedemption} disabled={processing} className="detail-button primary-button">
              {processing ? 'Processing...' : 'Process Redemption'}
            </button>
          </div>
        )}

        {/* Adjustment creation section */}
        {(currentUserRole === 'manager' || currentUserRole === 'superuser') && (
          <div className="detail-section">
            <h3>Transaction Adjustments</h3>
            <button onClick={handleCreateAdjustmentClick} className="detail-button tertiary-button">
              Create Adjustment
            </button>
            {creatingAdjustment && (
              <Form
                fields={[
                  { name: 'amount', label: 'Points Amount', type: 'number' },
                  { name: 'remark', label: 'Remark', type: 'text' },
                  ...(transaction?.type === 'purchase' ? [{ name: 'promotionIds', label: 'Promotion IDs', type: 'text' }] : [])
                ]}
                onSubmit={handleAdjustmentSubmit}
              />
            )}
            {feedbackMessage && (
              <p className={feedbackMessage.includes('Failed') ? 'error-message' : 'success-message'}>
                {feedbackMessage}
              </p>
            )}
          </div>
        )}

        {updateMsg && <p className="success-message">{updateMsg}</p>}
        
        <div className="action-buttons">
          <a href="/transactions" className="detail-button secondary-button">Back to Transactions List</a>
        </div>
      </div>
      
      {/* QR code section for redemptions */}
      {shouldShowQRCode() && (
        <div className="qr-code-container">
          <h3>Redemption QR Code</h3>
          <p>Show this QR code to a cashier to process your redemption.</p>
          <div className="qr-code">
            <QRCode value={generateQRCodeData()} size={200} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionDetailPage;
