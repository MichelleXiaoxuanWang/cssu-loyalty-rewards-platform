// src/pages/TransactionDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TransactionDetail, { TransactionDetailData } from '../components/TransactionDetailForm';

const TransactionDetailPage: React.FC = () => {
  // Retrieve both userId and transactionId from URL parameters.
  const { userId, transactionId } = useParams<{ userId: string; transactionId: string }>();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState<TransactionDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updateMsg, setUpdateMsg] = useState<string>('');
  const [suspicious, setSuspicious] = useState<boolean>(false);
  const [newUserRole, setNewUserRole] = useState<string>('');

  // Simulate current logged-in user's role; in a real app use a global auth context.
  const currentUserRole = localStorage.getItem('role') || 'manager';

  // Fetch transaction details on component mount
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const response = await fetch(`http://localhost:8000/transactions/${transactionId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
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

    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId]);

  // Handler to update suspicious flag
  const handleUpdateSuspicious = async () => {
    if (!transaction) return;
    try {
      const response = await fetch(`http://localhost:8000/transactions/${transaction.id}/suspicious`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ suspicious })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update suspicious status');
      }
      const updated = await response.json();
      setTransaction(updated);
      setUpdateMsg('Suspicious status updated successfully!');
    } catch (err: any) {
      setUpdateMsg(err.message);
    }
  };

  // Handler to update the associated user's role (only for superusers)
  const handleUpdateUserRole = async () => {
    if (!transaction || !newUserRole) return;
    try {
      const response = await fetch(`http://localhost:8000/users/${transaction.userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ role: newUserRole, verified: true })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user role');
      }
      await response.json();
      setUpdateMsg('User role updated successfully!');
    } catch (err: any) {
      setUpdateMsg(err.message);
    }
  };

  if (loading) return <p>Loading transaction details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!transaction) return <p>No transaction found.</p>;

  return (
    <div>
      <TransactionDetail
        transaction={transaction}
        currentUserRole={currentUserRole}
        suspicious={suspicious}
        newUserRole={newUserRole}
        setSuspicious={setSuspicious}
        setNewUserRole={setNewUserRole}
        onUpdateSuspicious={handleUpdateSuspicious}
        onUpdateUserRole={handleUpdateUserRole}
        updateMsg={updateMsg}
      />
    </div>
  );
};

export default TransactionDetailPage;
