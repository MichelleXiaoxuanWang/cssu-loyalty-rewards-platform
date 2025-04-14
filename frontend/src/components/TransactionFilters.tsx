import React, { useState } from 'react';
import { TransactionFilters as FiltersType, SORT_OPTIONS } from '../services/transaction.service';
import './TransactionFilters.css';

interface TransactionFiltersProps {
  onApplyFilters: (filters: FiltersType) => void;
  initialFilters?: FiltersType;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ 
  onApplyFilters, 
  initialFilters = {} 
}) => {
  const [filters, setFilters] = useState<FiltersType>({
    ...initialFilters,
    operator: initialFilters.operator || 'gte' // Set default operator if not provided
  });

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
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFilters(prev => ({ ...prev, [name]: checked || undefined }));
    } else if (['amount', 'relatedId', 'promotionId', 'page'].includes(name)) {
      const numValue = value === '' ? undefined : Number(value);
      setFilters(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value || undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate amount is positive integer if provided
    if (filters.amount !== undefined) {
      if (filters.amount < 0) {
        alert('Amount must be a positive integer');
        return;
      }
      if (!Number.isInteger(filters.amount)) {
        alert('Amount must be a whole number (integer)');
        return;
      }
      
      // If amount is provided, ensure operator is set
      if (!filters.operator) {
        filters.operator = 'gte'; // Default to gte if not set
      }
    } else {
      // If amount is not provided, remove operator
      delete filters.operator;
    }
    
    // Ensure relatedId is a number if provided
    if (filters.relatedId !== undefined) {
      filters.relatedId = Number(filters.relatedId);
    }
    
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
          <div className="filter-group type-filter">
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

          {/* Related ID Filter - Conditionally rendered based on transaction type */}
          {filters.type && filters.type !== 'purchase' ? (
            <div className="filter-group related-filter">
              <label htmlFor="relatedId">
                {filters.type === 'transfer' && 'Other User ID'}
                {filters.type === 'adjustment' && 'Adjusted Transaction ID'}
                {filters.type === 'redemption' && 'Cashier ID'}
                {filters.type === 'event' && 'Event ID'}
                <span className="hint-text">
                  {filters.type === 'transfer' && '(receiver/sender)'}
                  {filters.type === 'adjustment' && ''}
                  {filters.type === 'redemption' && '(who processed redemption)'}
                  {filters.type === 'event' && '(which awarded the points)'}
                </span>
              </label>
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
          ) : (
            <div className="filter-group related-filter"></div>
          )}

          {/* Promotion ID Filter */}
          <div className="filter-group promotion-filter">
            <label htmlFor="promotionId">
              Promotion Involved
              <span className="hint-text">(promotion ID)</span>
            </label>
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
            <label htmlFor="amount">
              Points Amount Involved
              <span className="hint-text">(positive integer)</span>
            </label>
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
                value={filters.amount ?? ''} 
                onChange={handleChange} 
                placeholder="Enter amount (optional)"
                step="1"
              />
            </div>
          </div>

          {/* Sort Filter */}
          <div className="filter-group sort-filter">
            <label htmlFor="sort">Sort By</label>
            <select 
              id="sort" 
              name="sort" 
              value={filters.sort || ''} 
              onChange={handleChange}
            >
              <option value="">Default (ID Descending)</option>
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Empty space next to sort */}
          <div className="filter-group empty-filter"></div>
        </div>

        {/* Additional Checkbox Filters */}
        <div className="checkbox-filters">
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="unprocessed"
                checked={filters.unprocessed || false}
                onChange={handleChange}
              />
              Only show unprocessed redemptions
            </label>
          </div>
          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="suspicious"
                checked={filters.suspicious || false}
                onChange={handleChange}
              />
              Only show suspicious transactions
            </label>
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
