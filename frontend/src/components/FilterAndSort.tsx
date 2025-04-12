import React, { useState } from 'react';
import './FilterAndSort.css';

type FilterAndSortProps = {
  filters: { label: string; value: string; options?: string[] }[];
  sortOptions: { label: string; value: string }[];
  onFilterChange: (filter: Record<string, any>) => void;
  onSortChange: (sort: string) => void;
  disabled?: boolean; // Added disabled prop
};

const FilterAndSort: React.FC<FilterAndSortProps> = ({ filters, sortOptions, onFilterChange, onSortChange, disabled }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');

  const handleFilterFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!disabled) {
      setSelectedFilter(e.target.value);
      setFilterValue(''); // Reset filter value when field changes
    }
  };

  const handleFilterValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!disabled) {
      setFilterValue(e.target.value);
    }
  };

  const applyFilter = () => {
    if (!disabled && selectedFilter) {
      onFilterChange({ [selectedFilter]: filterValue });
    }
  };

  return (
    <div className="filter-and-sort">
      <label htmlFor="filter-field">Filter:</label>
      <select id="filter-field" onChange={handleFilterFieldChange} disabled={disabled}>
        <option value="">Select a filter</option>
        {filters.map((filter) => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </select>

      {selectedFilter && (
        <div>
          <label htmlFor="filter-value">Value:</label>
          {filters.find((filter) => filter.value === selectedFilter)?.options ? (
            <select id="filter-value" value={filterValue} onChange={handleFilterValueChange} disabled={disabled}>
              <option value="">Select an option</option>
              {filters
                .find((filter) => filter.value === selectedFilter)
                ?.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>
          ) : (
            <input
              id="filter-value"
              type="text"
              value={filterValue}
              onChange={handleFilterValueChange}
              disabled={disabled}
            />
          )}
          <button onClick={applyFilter} disabled={disabled}>Apply</button>
        </div>
      )}

      <label htmlFor="sort-field">Order:</label>
      <select id="sort-field" onChange={(e) => onSortChange(e.target.value)} disabled={disabled}>
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FilterAndSort;