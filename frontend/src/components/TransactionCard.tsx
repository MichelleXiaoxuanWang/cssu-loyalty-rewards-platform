import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '../services/transaction.service';
import './TransactionCard.css';
import { getUserId } from '../services/auth.service';

// Import transaction type icons
import purchaseIcon from '../assets/purchase.png';
import redemptionIcon from '../assets/redempion.png';
import transferIcon from '../assets/transfer.png';
import adjustmentIcon from '../assets/adjustment.png';
import eventIcon from '../assets/event.png';

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
        return `Redemption${transaction.processed ? ' (Processed)' : ''}`;
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
  
  // Handle click to navigate to the transaction details page
  const handleClick = () => {
    // Get the current user ID from localStorage
    const userId = getUserId();
    // Navigate to the transaction detail page using the correct route pattern
    navigate(`/${userId}/transactions/${transaction.id}`);
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
          <h3 className="transaction-type">
            {getTransactionDescription(transaction)}
          </h3>
          <span 
            className={`transaction-amount ${transaction.amount >= 0 ? 'positive' : 'negative'}`}
          >
            {formatAmount(transaction.amount)} points
          </span>
        </div>
        
        <div className="transaction-info">
          <span className="transaction-id">ID: {transaction.id}</span>
          {transaction.remark && (
            <span className="transaction-remark">{transaction.remark}</span>
          )}
          <span className="transaction-created-by">Created by: {transaction.createdBy}</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
