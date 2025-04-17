import React, { useState } from 'react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import './CreateTransaction.css';
import { transferPoints, redeemPoints, purchaseTransaction, processRedemptionTransaction } from '../services/transaction.service';
import { isUserVerified } from '../services/auth.service';

const CreateTransaction: React.FC = () => {
  const [activeTab, setActiveTab] = useState('qrCode');
  const [userId, setUserId] = useState('');
  const [points, setPoints] = useState('');
  const [qrCodeData, setQrCodeData] = useState('');
  const [spent, setSpent] = useState('');
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

  const handleTabChange = (tab: 'qrCode' | 'transfer' | 'redemption' | 'purchase' | 'processRedemption'): void => {
    // For unverified regular users, disable transfer and redemption
    if (role === 'regular' && !userVerified && (tab === 'transfer' || tab === 'redemption')) {
      setErrorMessage('You need to be verified by a manager before you can transfer or redeem points');
      return;
    }
    
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null); // Clear success message when changing tabs
  };

  const handleTransfer = async () => {
    try {
      // Validate user ID
      if (!userId.trim()) {
        alert('Please enter a user ID');
        return;
      }

      // Validate points
      const pointsNum = Number(points);
      if (isNaN(pointsNum) || pointsNum <= 0) {
        alert('Please enter a valid points amount greater than 0');
        return;
      }

      const transactionData = {
        type: 'transfer',
        amount: pointsNum,
        remark: remark || '',
      };
      const result = await transferPoints(userId, transactionData);
      if (!result) {
        throw new Error('Transfer failed');
      }
      handleTransactionSuccess('Transfer successful!');
      console.log('Transfer successful:', result);
    } catch (error) {
      handleTransactionError('Transfer failed. Please try again.');
      console.error('Transfer failed:', error);
    }
  };

  const handleRedemption = async () => {
    try {
      // Validate points
      const pointsNum = Number(points);
      if (isNaN(pointsNum) || pointsNum <= 0) {
        alert('Please enter a valid points amount greater than 0');
        return;
      }

      const transactionData = {
        type: 'redemption',
        amount: pointsNum,
        remark: remark || '',
      };
      const result = await redeemPoints(transactionData);
      if (!result) {
        throw new Error('Redemption failed');
      }
      setQrCodeData(JSON.stringify(result));
      handleTransactionSuccess('Request successful，waiting to be verified!');
      console.log('Request successful，waiting to be verified:', result);
    } catch (error) {
      handleTransactionError('Redemption failed. Please try again.');
      console.error('Redemption failed:', error);
    }
  };

  const handlePurchase = async () => {
    try {
      // Validate user ID
      if (!userId.trim()) {
        alert('Please enter a utorid');
        return;
      }

      // Validate spent amount
      const spentNum = Number(spent);
      if (isNaN(spentNum) || spentNum <= 0) {
        alert('Please enter a valid spent amount greater than 0');
        return;
      }

      const transactionData = {
        utorid: userId,
        type: 'purchase',
        spent: spentNum,
        promotionIds: promotionIds ? promotionIds.split(',').map(Number) : undefined,
        remark: remark || '',
      };
      const result = await purchaseTransaction(transactionData);
      if (!result) {
        throw new Error('Purchase failed');
      }
      handleTransactionSuccess('Purchase successful!');
      console.log('Purchase successful:', result);
    } catch (error) {
      handleTransactionError('Purchase failed. Please try again.');
      console.error('Purchase failed:', error);
    }
  };

  const handleProcessRedemption = async () => {
    try {
      if (!relatedId) {
        setErrorMessage('Transaction ID is required to process redemption.');
        return;
      }

      const result = await processRedemptionTransaction(Number(relatedId));
      if (!result) {
        throw new Error('Process redemption failed');
      }
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
    
      <div className="page-header">
        <h1>Create Transaction</h1>
      </div>

      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      
      <div className="tabs">
        {role === 'regular' && (
          <button onClick={() => handleTabChange('qrCode')} className={activeTab === 'qrCode' ? 'active' : ''}>
            Initiate Transaction
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
        {role === 'cashier' && (
          <button onClick={() => handleTabChange('processRedemption')} className={activeTab === 'processRedemption' ? 'active' : ''}>
            Process Redemption
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'qrCode' && role === 'regular' && (
          <div className="qr-code-section">
            <div className="qr-code-card">
              <h2>My QR Code</h2>
              <p>Show this QR code to a cashier to earn points on your purchase</p>
              <div className="qr-code-container">
                <QRCode value={`User ID: ${String(currentUserId)}`} size={200} />
              </div>
              <div className="user-identifiers">
                <h2>My IDs</h2>
                <p>You can also use these IDs for transactions and activities</p>
                <div className="regular-id-container">
                  <p>User ID: {currentUserId}</p>
                  <p>UTORid: {currentUser}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transfer' && (
          <div>
            <h2>Transfer Points</h2>
            <input
              type="text"
              placeholder="Enter User ID to transfer to"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <input
              type="number"
              placeholder="Enter Points to transfer (non-negative integer)"
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
              placeholder="Enter Points to redeem (non-negative integer)"
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
              placeholder="Enter Spent Amount (non-negative)"
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