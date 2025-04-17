import React from 'react';
import './Pagination.css';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
};

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  onLimitChange,
  itemsPerPage = 10,
  totalItems = 0, 
}) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = parseInt(e.target.value, 10);
    if (onLimitChange) {
      onLimitChange(newLimit);
    }
  };

  const displayCurrentPage = totalPages === 0 ? 0 : currentPage;
  const displayTotalPages = totalPages === 0 ? 0 : totalPages;

  return (
    <div className="pagination">
      <div>
        <button onClick={handlePrevious} disabled={currentPage === 1 || totalPages === 0}>
          Previous
        </button>
        <span>
          Page {displayCurrentPage} of {displayTotalPages}
        </span>
        <button onClick={handleNext} disabled={currentPage === totalPages || totalPages === 0}>
          Next
        </button>
      </div>
      <div className="pagination-controls">
        {onLimitChange && (
          <div>
            <label htmlFor="limit-select">Items per page:</label>
            <select 
              id="limit-select" 
              onChange={handleLimitChange}
              value={itemsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        )}
        {totalItems > 0 && (
          <div className="total-items">
            Total: {totalItems}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination;