import React, { useState } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import './CreateTransaction.css';
import { transferPoints, redeemPoints, purchaseTransaction, adjustmentTransaction, processRedemptionTransaction } from '../services/transaction.service';
import { isUserVerified } from '../services/auth.service';

const CreateTransaction: React.FC = () => {
  const [activeTab, setActiveTab] = useState('qrCode');
  const [userId, setUserId] = useState('');
  const [points, setPoints] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [spent, setSpent] = useState('');
  const [amount, setAmount] = useState('');
  const [relatedId, setRelatedId] = useState('');
  const [promotionIds, setPromotionIds] = useState('');
  const [remark, setRemark] = useState('');
  const currentUser = localStorage.getItem('currentUser');
  const role = localStorage.getItem(`current_role_${currentUser}`);
  const currentUserId = localStorage.getItem(`userId_${currentUser}`);
  
  // Check user verification status
  const userVerified = isUserVerified();

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Set default tab based on verification status - unverified regular users should see QR code by default
  useState(() => {
    if (role === 'regular' && !userVerified) {
      setActiveTab('qrCode');
    }
  });

  const handleTransactionSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage(null);
  };

  const handleTransactionError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage(null);
  };

  const handleTabChange = (tab: 'qrCode' | 'transfer' | 'redemption' | 'purchase' | 'adjustment' | 'processRedemption'): void => {
    // For unverified regular users, disable transfer and redemption
    if (role === 'regular' && !userVerified && (tab === 'transfer' || tab === 'redemption')) {
      setErrorMessage('You need to be verified by a manager before you can transfer or redeem points');
      return;
    }
    
    setActiveTab(tab);
    setErrorMessage(null);
  };

  const handleTransfer = async () => {
    try {
      const transactionData = {
        type: 'transfer',
        amount: Number(points),
        remark: remark || '',
      };
      const result = await transferPoints(userId, transactionData);
      handleTransactionSuccess('Transfer successful!');
      console.log('Transfer successful:', result);
    } catch (error) {
      handleTransactionError('Transfer failed. Please try again.');
      console.error('Transfer failed:', error);
    }
  };

  const handleRedemption = async () => {
    try {
      const transactionData = {
        type: 'redemption',
        amount: Number(points),
        remark: remark || '',
      };
      const result = await redeemPoints(transactionData);
      setQrCodeData(JSON.stringify(result));
      handleTransactionSuccess('Redemption successful!');
      console.log('Redemption successful:', result);
    } catch (error) {
      handleTransactionError('Redemption failed. Please try again.');
      console.error('Redemption failed:', error);
    }
  };

  const handlePurchase = async () => {
    try {
      const transactionData = {
        utorid: userId,
        type: 'purchase',
        spent: Number(spent),
        promotionIds: promotionIds ? promotionIds.split(',').map(Number) : undefined,
        remark: remark || '',
      };
      const result = await purchaseTransaction(transactionData);
      handleTransactionSuccess('Purchase successful!');
      console.log('Purchase successful:', result);
    } catch (error) {
      handleTransactionError('Purchase failed. Please try again.');
      console.error('Purchase failed:', error);
    }
  };

  const handleAdjustment = async () => {
    try {
      const transactionData = {
        utorid: userId,
        type: 'adjustment',
        amount: Number(amount),
        relatedId: Number(relatedId),
        promotionIds: promotionIds ? promotionIds.split(',').map(Number) : undefined,
        remark: remark || '',
      };
      const result = await adjustmentTransaction(transactionData);
      handleTransactionSuccess('Adjustment successful!');
      console.log('Adjustment successful:', result);
    } catch (error) {
      handleTransactionError('Adjustment failed. Please try again.');
      console.error('Adjustment failed:', error);
    }
  };

  const handleProcessRedemption = async () => {
    try {
      if (!relatedId) {
        setErrorMessage('Transaction ID is required to process redemption.');
        return;
      }

      const result = await processRedemptionTransaction(Number(relatedId));
      handleTransactionSuccess('Redemption processed successfully!');
      console.log('Redemption processed:', result);
    } catch (error) {
      handleTransactionError('Process redemption failed. Please try again.');
      console.error('Error processing redemption:', error);
    }
  };

  return (
    <div className="create-transaction">
      {!userVerified && role === 'regular' && (
        <div className="verification-warning">
          <h3>Account Not Verified</h3>
          <p>Your account has not been verified by a manager yet. Until verification, you cannot transfer or redeem points.</p>
        </div>
      )}
    
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      
      <div className="tabs">
        {role === 'regular' && (
          <button onClick={() => handleTabChange('qrCode')} className={activeTab === 'qrCode' ? 'active' : ''}>
            Transaction QR Code
          </button>
        )}
        {role === 'regular' && (<button 
          onClick={() => handleTabChange('transfer')} 
          className={`${activeTab === 'transfer' ? 'active' : ''} ${role === 'regular' && !userVerified ? 'disabled' : ''}`}
          disabled={role === 'regular' && !userVerified}
        >
          Transfer Points
        </button>)}
        {role === 'regular' && (<button 
          onClick={() => handleTabChange('redemption')} 
          className={`${activeTab === 'redemption' ? 'active' : ''} ${role === 'regular' && !userVerified ? 'disabled' : ''}`}
          disabled={role === 'regular' && !userVerified}
        >
          Redeem Points
        </button>)}
        {role !== 'regular' && (
          <button onClick={() => handleTabChange('purchase')} className={activeTab === 'purchase' ? 'active' : ''}>
            Purchase
          </button>
        )}
        {role !== 'regular' && role !== 'cashier' && (
          <button onClick={() => handleTabChange('adjustment')} className={activeTab === 'adjustment' ? 'active' : ''}>
            Adjustment
          </button>
        )}
        {role === 'cashier' && (
          <button onClick={() => handleTabChange('processRedemption')} className={activeTab === 'processRedemption' ? 'active' : ''}>
            Process Redemption
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'qrCode' && role === 'regular' && (
          <div>
            <h2>Initiate Transaction</h2>
            <h3>Current User ID</h3>
            <QRCode value={`User ID: ${String(currentUserId)}`} />
          </div>
        )}

        {activeTab === 'transfer' && (
          <div>
            <h2>Transfer Points</h2>
            <input
              type="text"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter Points"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
            <button onClick={handleTransfer}>Transfer</button>
          </div>
        )}

        {activeTab === 'redemption' && (
          <div>
            <h2>Redeem Points</h2>
            <input
              type="number"
              placeholder="Enter Points"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
            <button onClick={handleRedemption}>Redeem</button>
            {qrCodeData && (
              <div style={{ marginTop: '1rem' }}>
                <QRCode value={qrCodeData} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'purchase' && role !== 'regular' && (
          <div>
            <h2>Purchase</h2>
            <input
              type="text"
              placeholder="Enter User utorid"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter Spent Amount"
              value={spent}
              onChange={(e) => setSpent(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Promotion IDs (comma-separated)"
              value={promotionIds}
              onChange={(e) => setPromotionIds(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
            <button onClick={handlePurchase}>Purchase</button>
          </div>
        )}

        {activeTab === 'adjustment' && role !== 'regular' && (
          <div>
            <h2>Adjustment</h2>
            <input
              type="text"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter Adjustment Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter ID of Related Transaction"
              value={relatedId}
              onChange={(e) => setRelatedId(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Promotion IDs (comma-separated)"
              value={promotionIds}
              onChange={(e) => setPromotionIds(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
            <button onClick={handleAdjustment}>Adjust</button>
          </div>
        )}

        {activeTab === 'processRedemption' && role === 'cashier' && (
          <div>
            <h2>Process Redemption</h2>
            <input
              type="number"
              placeholder="Enter Transaction ID"
              value={relatedId}
              onChange={(e) => setRelatedId(e.target.value)}
            />
            <button onClick={handleProcessRedemption}>Process</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTransaction;