import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TransactionFilters from '../components/TransactionFilters';
import TransactionCard from '../components/TransactionCard';
import Pagination from '../components/Pagination';
import { getMyTransactions, TransactionFilters as FiltersType, TransactionResponse, Transaction } from '../services/transaction.service';
import './TransactionPreviewPage.css';

const TransactionPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalTransactions, setTotalTransactions] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    limit: 10
  });

  // Fetch transactions when filters change
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const response: TransactionResponse = await getMyTransactions(filters);
        setTransactions(response.results);
        setTotalTransactions(response.count);
        setCurrentPage(filters.page || 1);
        setItemsPerPage(filters.limit || 10);
      } catch (err) {
        setError('Failed to load transactions. Please try again later.');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [filters]);

  // Handle filter changes
  const handleApplyFilters = (newFilters: FiltersType) => {
    // Ensure page is reset when applying new filters
    setFilters({ ...newFilters, page: 1 });
  };

  // Handle pagination page change
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Handle pagination limit change
  const handleLimitChange = (newLimit: number) => {
    setFilters(prev => ({ ...prev, page: 1, limit: newLimit }));
  };

  // Navigate to create transaction page
  const handleCreateTransaction = () => {
    navigate('/createTransaction');
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalTransactions / itemsPerPage);

  return (
    <div className="transaction-preview-page">
      <div className="page-header">
        <h1>My Transactions</h1>
        <button 
          className="create-transaction-button"
          onClick={handleCreateTransaction}
        >
          Create Transaction
        </button>
      </div>

      <TransactionFilters 
        onApplyFilters={handleApplyFilters} 
        initialFilters={filters}
      />

      <div className="transactions-container">
        {loading ? (
          <div className="loading-spinner">Loading transactions...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="no-transactions">
            <p>No transactions found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <div className="transactions-summary">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalTransactions)} - {Math.min(currentPage * itemsPerPage, totalTransactions)} of {totalTransactions} transactions
            </div>
            
            <div className="transactions-list">
              {transactions.map(transaction => (
                <TransactionCard 
                  key={transaction.id} 
                  transaction={transaction} 
                />
              ))}
            </div>
            
            {totalPages > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionPreviewPage;
