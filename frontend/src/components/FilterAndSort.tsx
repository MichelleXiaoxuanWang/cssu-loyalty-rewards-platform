import React, { useState } from 'react';

type FilterAndSortProps = {
  filters: { label: string; value: string; options?: string[] }[];
  sortOptions: { label: string; value: string }[];
  onFilterChange: (filter: Record<string, any>) => void;
  onSortChange: (sort: string) => void;
};

const FilterAndSort: React.FC<FilterAndSortProps> = ({ filters, sortOptions, onFilterChange, onSortChange }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');

  const handleFilterFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFilter(e.target.value);
    setFilterValue(''); // Reset filter value when field changes
  };

  const handleFilterValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilterValue(e.target.value);
  };

  const applyFilter = () => {
    if (selectedFilter) {
      onFilterChange({ [selectedFilter]: filterValue });
    }
  };

  const getFilterInput = () => {
    const selected = filters.find((filter) => filter.value === selectedFilter);
    if (selected?.options) {
      return (
        <select id="filter-value" value={filterValue} onChange={handleFilterValueChange}>
          <option value="">Select an option</option>
          {selected.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }
    return (
      <input
        id="filter-value"
        type="text"
        value={filterValue}
        onChange={handleFilterValueChange}
      />
    );
  };

  return (
    <div className="filter-and-sort">
      <label htmlFor="filter-field">Filter:</label>
      <select id="filter-field" onChange={handleFilterFieldChange}>
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
          {getFilterInput()}
          <button onClick={applyFilter}>Apply</button>
        </div>
      )}

      <label htmlFor="sort-field">Order:</label>
      <select id="sort-field" onChange={(e) => onSortChange(e.target.value)}>
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