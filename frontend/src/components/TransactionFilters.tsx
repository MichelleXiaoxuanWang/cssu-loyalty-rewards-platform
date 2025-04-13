import React, { useState } from 'react';
import { TransactionFilters as FiltersType } from '../services/transaction.service';
import './TransactionFilters.css';

interface TransactionFiltersProps {
  onApplyFilters: (filters: FiltersType) => void;
  initialFilters?: FiltersType;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ 
  onApplyFilters, 
  initialFilters = {} 
}) => {
  const [filters, setFilters] = useState<FiltersType>(initialFilters);

  // Transaction type options
  const transactionTypes = [
    { value: '', label: 'All Types' },
    { value: 'purchase', label: 'Purchase' },
    { value: 'redemption', label: 'Redemption' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'adjustment', label: 'Adjustment' },
    { value: 'event', label: 'Event' }
  ];

  // Amount operators
  const operators = [
    { value: 'gte', label: 'Greater than or equal to' },
    { value: 'lte', label: 'Less than or equal to' }
  ];

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Convert numeric values
    if (['amount', 'relatedId', 'promotionId', 'page', 'limit'].includes(name)) {
      const numValue = value === '' ? undefined : Number(value);
      setFilters(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value || undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(filters);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = {};
    setFilters(resetFilters);
    onApplyFilters(resetFilters);
  };

  return (
    <div className="transaction-filters">
      <h3>Filter Transactions</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="filters-grid">
          {/* Transaction Type Filter */}
          <div className="filter-group">
            <label htmlFor="type">Transaction Type</label>
            <select 
              id="type" 
              name="type" 
              value={filters.type || ''} 
              onChange={handleChange}
            >
              {transactionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Related ID Filter */}
          <div className="filter-group">
            <label htmlFor="relatedId">Related ID</label>
            <input 
              type="number" 
              id="relatedId" 
              name="relatedId" 
              value={filters.relatedId || ''} 
              onChange={handleChange} 
              placeholder="Enter ID"
              min="1"
            />
          </div>

          {/* Promotion ID Filter */}
          <div className="filter-group">
            <label htmlFor="promotionId">Promotion ID</label>
            <input 
              type="number" 
              id="promotionId" 
              name="promotionId" 
              value={filters.promotionId || ''} 
              onChange={handleChange} 
              placeholder="Enter ID"
              min="1"
            />
          </div>

          {/* Amount Filter with Operator */}
          <div className="filter-group amount-filter">
            <label htmlFor="amount">Points Amount</label>
            <div className="amount-filter-group">
              <select 
                id="operator" 
                name="operator" 
                value={filters.operator || 'gte'} 
                onChange={handleChange}
              >
                {operators.map(op => (
                  <option key={op.value} value={op.value}>
                    {op.label}
                  </option>
                ))}
              </select>
              <input 
                type="number" 
                id="amount" 
                name="amount" 
                value={filters.amount || ''} 
                onChange={handleChange} 
                placeholder="Enter amount"
              />
            </div>
          </div>

          {/* Page Size Filter */}
          <div className="filter-group">
            <label htmlFor="limit">Results per page</label>
            <select 
              id="limit" 
              name="limit" 
              value={filters.limit || '10'} 
              onChange={handleChange}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="filter-actions">
          <button type="button" onClick={handleReset} className="reset-button">
            Reset Filters
          </button>
          <button type="submit" className="apply-button">
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionFilters;
