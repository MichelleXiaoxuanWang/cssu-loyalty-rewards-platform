// src/components/TransactionDetail.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export interface TransactionDetailData {
  id: number;
  utorid: string;
  userId: number;
  type: string;
  spent?: number;
  amount: number;
  suspicious: boolean;
  remark: string;
  createdBy: string;
  relatedId?: number;
}

interface TransactionDetailProps {
  transaction: TransactionDetailData;
  currentUserRole: string;
  suspicious: boolean;
  newUserRole: string;
  setSuspicious: (value: boolean) => void;
  setNewUserRole: (value: string) => void;
  onUpdateSuspicious: () => void;
  onUpdateUserRole: () => void;
  updateMsg: string;
}

const TransactionDetail: React.FC<TransactionDetailProps> = ({
  transaction,
  currentUserRole,
  suspicious,
  newUserRole,
  setSuspicious,
  setNewUserRole,
  onUpdateSuspicious,
  onUpdateUserRole,
  updateMsg
}) => {
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

      {/* Only managers or superusers can edit */}
      {(currentUserRole === 'manager' || currentUserRole === 'superuser') && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h3>Edit Transaction</h3>
          <div>
            <label>
              <input
                type="checkbox"
                checked={suspicious}
                onChange={(e) => setSuspicious(e.target.checked)}
              />
              {' '}Mark as suspicious
            </label>
          </div>
          <button onClick={onUpdateSuspicious} style={{ marginTop: '0.5rem' }}>
            Update Suspicious Status
          </button>
        </div>
      )}

      {/* Superusers get an extra section to update the associated user's role */}
      {currentUserRole === 'superuser' && (
        <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h3>Edit Associated User Role</h3>
          <div>
            <label htmlFor="userRoleSelect">Select New Role:</label>
            <select
              id="userRoleSelect"
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="">-- Select Role --</option>
              <option value="regular">regular</option>
              <option value="cashier">cashier</option>
              <option value="manager">manager</option>
              <option value="superuser">superuser</option>
            </select>
          </div>
          <button onClick={onUpdateUserRole} style={{ marginTop: '0.5rem' }}>
            Update User Role
          </button>
        </div>
      )}

      {updateMsg && <p style={{ marginTop: '1rem', color: 'green' }}>{updateMsg}</p>}

      <p style={{ marginTop: '1rem' }}>
        <Link to={`/${transaction.utorid}/transactions`}>Back to Transactions List</Link>
      </p>
    </div>
  );
};

export default TransactionDetail;
