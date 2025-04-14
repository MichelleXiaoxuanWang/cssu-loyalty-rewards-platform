import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyTransactions, getAllTransactions, TransactionFilters as FiltersType, TransactionResponse, Transaction } from '../services/transaction.service';
import { getCurrentRole, getUserUtorid } from '../services/auth.service';
import TransactionCard from '../components/TransactionCard';
import TransactionFilters from '../components/TransactionFilters';
import Pagination from '../components/Pagination';
import { getMyTransactions, getAllTransactions, TransactionFilters as FiltersType, TransactionResponse, Transaction } from '../services/transaction.service';
import './TransactionPreviewPage.css';

const TransactionPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);

  // Get current user role and ID

  const currentRole = getCurrentRole();
  const currentUser = getUserUtorid();
  
  // Determine if admin role (manager or superuser) to show all transactions

  const isAdminRole = currentRole === 'manager' || currentRole === 'superuser';

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser || !currentRole) {
      navigate('/login');
    }
  }, [currentUser, currentRole]);

  useEffect(() => {
    if (currentUser && currentRole) {
      fetchTransactions();
    }
  }, [filters, currentUser, currentRole]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response: TransactionResponse = isAdminRole 
        ? await getAllTransactions(filters)
        : await getMyTransactions(filters);
      setTransactions(response.results);
      setTotalPages(Math.ceil(response.count / (filters.limit || 10)));
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FiltersType) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleTransactionClick = (transactionId: number) => {
    if (currentUser) {
      navigate(`/${currentUser}/transactions/${transactionId}`);
    }

  if (!currentUser || !currentRole) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="transaction-preview-page">

      <h1>{isAdminRole ? 'All Transactions' : 'My Transactions'}</h1>
      
      <TransactionFilters 
        onApplyFilters={handleFilterChange}
        initialFilters={filters}
      />

      <div className="transactions-list">
        {transactions.map(transaction => (
          <div 
            key={transaction.id}
            onClick={() => handleTransactionClick(transaction.id)}
            style={{ cursor: 'pointer' }}
          >
            <TransactionCard
              transaction={transaction}
            />
          </div>
        ))}
      </div>

      <Pagination
        currentPage={filters.page || 1}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        itemsPerPage={filters.limit || 10}
      />
    </div>
  );
};

export default TransactionPreviewPage;
