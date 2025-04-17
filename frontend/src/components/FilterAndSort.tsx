import React, { useState, useEffect } from 'react';
import './FilterAndSort.css';

type FilterOption = {
  label: string;
  value: string;
  options?: string[];
};

type SortOption = {
  label: string;
  value: string;
};

type FilterAndSortProps = {
  filters: FilterOption[];
  sortOptions: SortOption[];
  onFilterChange: (filter: Record<string, any>) => void;
  onSortChange: (sort: string) => void;
  initialFilters?: Record<string, any>;
};

const FilterAndSort: React.FC<FilterAndSortProps> = ({
  filters,
  sortOptions,
  onFilterChange,
  onSortChange,
  initialFilters = {}
}) => {
  const [filterValues, setFilterValues] = useState<Record<string, any>>(initialFilters);
  const [timeStatusType, setTimeStatusType] = useState<string>('');
  const [timeStatusValue, setTimeStatusValue] = useState<string>('');

  // Find if we have started/ended filters that need special handling
  const hasStartedEndedFilters = filters.some(f => f.value === 'started') && 
                               filters.some(f => f.value === 'ended');
  
  // Get all filters except started/ended when we need special handling
  const regularFilters = hasStartedEndedFilters 
    ? filters.filter(f => f.value !== 'started' && f.value !== 'ended')
    : filters;

  // Set initial time status values if present
  useEffect(() => {
    if (hasStartedEndedFilters) {
      if (initialFilters.started !== undefined) {
        setTimeStatusType('started');
        setTimeStatusValue(initialFilters.started);
      } else if (initialFilters.ended !== undefined) {
        setTimeStatusType('ended');
        setTimeStatusValue(initialFilters.ended);
      }
    }
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFilterValues(prev => ({
      ...prev,
      [name]: value || undefined
    }));
  };

  // Handle time status type change
  const handleTimeStatusTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setTimeStatusType(value);
    
    // Reset value when type changes
    setTimeStatusValue('');
  };

  // Handle time status value change
  const handleTimeStatusValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setTimeStatusValue(value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a copy of the filters with only non-empty values
    const submittedFilters = Object.entries(filterValues)
      .reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
    
    // Add time status filter if needed
    if (hasStartedEndedFilters && timeStatusType && timeStatusValue) {
      submittedFilters[timeStatusType] = timeStatusValue;
    }
    
    onFilterChange(submittedFilters);
  };

  // Reset filters
  const handleReset = () => {
    const resetFilters = {};
    setFilterValues(resetFilters);
    setTimeStatusType('');
    setTimeStatusValue('');
    onFilterChange(resetFilters);
  };

  // Sort change handler
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    onSortChange(value);
    setFilterValues(prev => ({
      ...prev,
      sort: value
    }));
  };

  return (
    <div className="filter-and-sort">
      <div className="filters-header">
        <h3>Filter and Sort</h3>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="filters-grid">
          {regularFilters.map((filter) => (
            <div key={filter.value} className="filter-group">
              <label htmlFor={filter.value}>
                {filter.label}
                {filter.options && <span className="hint-text">(select one)</span>}
              </label>
              
              {filter.options ? (
                <select
                  id={filter.value}
                  name={filter.value}
                  value={filterValues[filter.value] || ''}
                  onChange={handleChange}
                >
                  <option value="">All {filter.label}s</option>
                  {filter.options.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  id={filter.value}
                  name={filter.value}
                  value={filterValues[filter.value] || ''}
                  onChange={handleChange}
                  placeholder={`Filter by ${filter.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
          
          {/* Special handling for started/ended filters */}
          {hasStartedEndedFilters && (
            <>
              <div className="filter-group">
                <label htmlFor="timeStatusType">
                  Time Status
                  <span className="hint-text">(choose type)</span>
                </label>
                <select
                  id="timeStatusType"
                  name="timeStatusType"
                  value={timeStatusType}
                  onChange={handleTimeStatusTypeChange}
                >
                  <option value="">No Time Filter</option>
                  <option value="started">Started</option>
                  <option value="ended">Ended</option>
                </select>
              </div>
              
              {timeStatusType && (
                <div className="filter-group">
                  <label htmlFor="timeStatusValue">
                    Status Value
                    <span className="hint-text">(true/false)</span>
                  </label>
                  <select
                    id="timeStatusValue"
                    name="timeStatusValue"
                    value={timeStatusValue}
                    onChange={handleTimeStatusValueChange}
                  >
                    <option value="">Select a value</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              )}
            </>
          )}
          
          {/* Sort dropdown */}
          <div className="filter-group">
            <label htmlFor="sort">Sort By</label>
            <select
              id="sort"
              name="sort"
              value={filterValues.sort || ''}
              onChange={handleSortChange}
            >
              <option value="">Default Order</option>
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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

export default FilterAndSort;