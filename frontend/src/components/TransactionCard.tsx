import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../services/transaction.service';
import './TransactionCard.css';
import { getUserId } from '../services/auth.service';

// Import transaction type icons
import purchaseIcon from '../assets/purchase.png';  // Attribute: this is external image from https://www.veryicon.com/icons/miscellaneous/common-icons-17/purchase-21.html
import redemptionIcon from '../assets/redempion.png';  // Attribute: this is external image from https://www.veryicon.com/icons/miscellaneous/common-icons-17/purchase-21.html
import transferIcon from '../assets/transfer.png';  // Attribute: this is external image from https://www.flaticon.com/free-icon/transfer_876784
import adjustmentIcon from '../assets/adjustment.png';  // Attribute: this is external image from https://www.vecteezy.com/png/19552595-sign-up-icon-signup-square-box-on-transparent-background
import eventIcon from '../assets/event.png';  // Attribute: this is external image from https://pngtree.com/freepng/events-line-icon-vector_9020887.html

interface TransactionCardProps {
  transaction: Transaction;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const navigate = useNavigate();
  
  // Function to get the appropriate icon based on transaction type
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return purchaseIcon;
      case 'redemption':
        return redemptionIcon;
      case 'transfer':
        return transferIcon;
      case 'adjustment':
        return adjustmentIcon;
      case 'event':
        return eventIcon;
      default:
        return purchaseIcon; // Default icon
    }
  };
  
  // Function to get the color for the transaction type
  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'var(--purchase-color)';
      case 'redemption':
        return 'var(--redemption-color)';
      case 'transfer':
        return 'var(--transfer-color)';
      case 'adjustment':
        return 'var(--adjustment-color)';
      case 'event':
        return 'var(--event-color)';
      default:
        return 'var(--purchase-color)';
    }
  };
  
  // Function to format the amount with a + or - sign
  const formatAmount = (amount: number) => {
    return amount >= 0 ? `+${amount}` : `${amount}`;
  };
  
  // Function to format the transaction description
  const getTransactionDescription = (transaction: Transaction) => {
    switch (transaction.type) {
      case 'purchase':
        return `Purchase - Spent $${transaction.spent?.toFixed(2)}`;
      case 'redemption':
        return `Redemption`;
      case 'transfer':
        // Different message based on whether this is incoming or outgoing
        return transaction.amount > 0 
          ? 'Transfer Received' 
          : 'Transfer Sent';
      case 'adjustment':
        return `Adjustment for Transaction #${transaction.relatedId}`;
      case 'event':
        return `Event Reward`;
      default:
        return String(transaction.type).charAt(0).toUpperCase() + String(transaction.type).slice(1);
    }
  };
  
  // Check if a redemption is processed (has relatedId)
  const isRedemptionProcessed = () => {
    return transaction.type === 'redemption' && 
           transaction.relatedId !== undefined && 
           transaction.relatedId !== null;
  };
  
  // Handle click to navigate to the transaction details page
  const handleClick = () => {
    // Get the current user ID from localStorage
    const userId = getUserId();
    // Navigate to the transaction detail page using the correct route pattern
    navigate(`/${userId}/transactions/${transaction.id}`);
  };
  
  // Function to format the date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to get related entity description
  const getRelatedEntityInfo = () => {
    console.log('Transaction data:', {
      type: transaction.type,
      relatedUtorid: transaction.relatedUtorid,
      relatedId: transaction.relatedId,
      fullTransaction: transaction
    });

    switch (transaction.type) {
      case 'transfer':
        return {
          label: transaction.amount > 0 ? 'Sender' : 'Receiver',
          value: transaction.relatedUtorid || 'N/A'
        };
      case 'redemption':
        return {
          label: 'Processed by',
          value: transaction.relatedUtorid || 'N/A'
        };
      case 'event':
        return {
          label: 'Event ID',
          value: transaction.relatedId || 'N/A'
        };
      case 'adjustment':
        return {
          label: 'Adjusted Transaction ID',
          value: transaction.relatedId || 'N/A'
        };
      default:
        return null;
    }
  };
  
  return (
    <div 
      className="transaction-card" 
      onClick={handleClick}
    >
      <div 
        className="transaction-icon-container"
        style={{ backgroundColor: getTransactionColor(transaction.type) }}
      >
        <img 
          src={getTransactionIcon(transaction.type)} 
          alt={transaction.type} 
          className="transaction-icon" 
        />
      </div>
      
      <div className="transaction-details">
        <div className="transaction-header">
          <div className="transaction-title-container">
            <h3 className="transaction-type">
              {getTransactionDescription(transaction)}
            </h3>
            
            {/* Status indicators */}
            <div className="transaction-status-indicators">
              {transaction.suspicious && (
                <span className="status-tag suspicious-tag">Suspicious</span>
              )}
              
              {transaction.type === 'redemption' && (
                <span className={`status-tag ${isRedemptionProcessed() ? 'processed-tag' : 'unprocessed-tag'}`}>
                  {isRedemptionProcessed() ? 'Processed' : 'Pending'}
                </span>
              )}
            </div>
          </div>
          
          <span 
            className={`transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}`}
          >
            {formatAmount(transaction.amount)} points
          </span>
        </div>
        
        <div className="transaction-info">
          <div className="transaction-info-row">
            <span className="transaction-id">ID: {transaction.id}</span>
            <span className="transaction-created-by">Created by: {transaction.createdBy}</span>
            {getRelatedEntityInfo() && (
              <span className="transaction-related">
                {getRelatedEntityInfo()?.label}: {getRelatedEntityInfo()?.value}
              </span>
            )}
          </div>
          <div className="transaction-info-row">
            <span className="transaction-date">Date: {formatDate(transaction.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
