import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import Form from '../components/Form';
import Pagination from '../components/Pagination';
import FilterAndSort from '../components/FilterAndSort';
import { fetchPromotions, createPromotion, Promotion, PromotionFilters, PromotionResponse } from '../services/promotion.service';
import '../styles/ListingPage.css';

const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  // const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [creatingPromotion, setCreatingPromotion] = useState(false);
  const [totalPromotions, setTotalPromotions] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PromotionFilters>({
      page: 1,
      limit: 5
    });
  const currentUser = localStorage.getItem('currentUser');
  const role = localStorage.getItem(`current_role_${currentUser}`);

  useEffect(() => {
      const loadPromotions = async () => {
        // setLoading(true);
        try {
          const response: PromotionResponse = await fetchPromotions(filters);
          setPromotions(response.results);
          setTotalPromotions(response.count);
          setCurrentPage(filters.page || 1);
          setItemsPerPage(filters.limit || 10);
        } catch (err) {
          // setError('Failed to load promotions. Please try again later.');
          console.error('Error fetching promotions:', err);
        } finally {
          // setLoading(false);
        }
      };
  
      loadPromotions();
    }, [filters, role]);

  const handleCreate = () => {
    setCreatingPromotion(true);
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      let newPromotion: Promotion;
      if (creatingPromotion) {
        if (formData.type == undefined || formData.type == null || formData.type == "") {
          formData.type = "automatic";
        }
        newPromotion = await createPromotion(formData);
        setCreatingPromotion(false);
        // Check if the current page is full
        if (promotions.length >= itemsPerPage) {
          // Move to the next page and add the new event there
          setCurrentPage((prevPage) => prevPage + 1);
          setFilters((prevFilters) => ({ ...prevFilters, page: currentPage + 1 }));
          setPromotions([newPromotion]); // Set the new event as the first item on the new page
        } else {
          // Add the new event to the current page
          setPromotions((prevPromotions) => [...prevPromotions, newPromotion]);
        }
      }
      setFeedbackMessage('Submission successful!');
    } catch (error: any) {
      alert(error.message);
      setFeedbackMessage('Submission failed. Please try again.');
    }
  };

  const handleFilterChange = async (newFilters: PromotionFilters) => {
    setFilters({ ...newFilters, page: 1, limit: itemsPerPage });
  };

  const handleSortChange = (sort: string) => {
    setFilters(prev => ({ ...prev, sort }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setFilters(prev => ({ ...prev, page: 1, limit: newLimit }));
  };

  const totalPages = Math.ceil(totalPromotions / itemsPerPage);

  if (role === 'regular' || role === 'cashier') {
    return (
      <div>
        <h1>Promotions</h1>
        {promotions && promotions.length === 0 ? (
          <div>No promotions available</div>
        ) : (
          promotions?.map((promotion) => (
            <ItemBox
            key={promotion.id}
            title={`${promotion.name}`}
            description={`${promotion.type}`}
            navigateTo={`/promotions/${promotion.id}`}
            id={promotion.id}
            extraInfo={[
              { label: 'Start Time', value: promotion.startTime ? new Date(promotion.startTime).toLocaleDateString() : 'N/A' },
              { label: 'End Time', value: promotion.endTime ? new Date(promotion.endTime).toLocaleDateString() : 'N/A' },
              promotion.minSpending !== undefined ? { label: 'Min Spending', value: `$${promotion.minSpending}` } : null,
              promotion.rate !== undefined ? { label: 'Rate', value: `${promotion.rate}` } : null,
              promotion.points !== undefined ? { label: 'Points', value: promotion.points } : null
            ].filter(Boolean) as {label: string; value: string | number}[]}
          />
          ))
        )}
      </div>
    );
  }

  return (
    <div className="listing-page">
      <h1>Promotions</h1>
      {feedbackMessage && <p style={{ color: feedbackMessage.includes('failed') ? 'red' : 'green' }}>{feedbackMessage}</p>}
      <button className="listing-create-button" onClick={handleCreate}>+ Create New Promotion</button>
      {(creatingPromotion) && (
        <Form
          fields={[
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'description', label: 'Description', type: 'text' },
            { name: 'type', label: 'Type', type: 'select', options: ['automatic', 'one-time'] },
            { name: 'startTime', label: 'Start Time', type: 'datetime-local' },
            { name: 'endTime', label: 'End Time', type: 'datetime-local' },
            { name: 'minSpending', label: 'Minimum Spending', type: 'number' },
            { name: 'rate', label: 'Rate', type: 'number' },
            { name: 'points', label: 'Points', type: 'number' },
          ]}
          onSubmit={handleSubmit}
        />
      )}
      <FilterAndSort
        filters={[
          { label: 'Name', value: 'name' },
          { label: 'Type', value: 'type', options: ['automatic', 'one-time'] },
          { label: 'Started', value: 'started', options: ['true', 'false'] },
          { label: 'Ended', value: 'ended', options: ['true', 'false'] },
        ]}
        sortOptions={[
          { label: 'ID (Ascending)', value: 'id-asc' },
          { label: 'ID (Descending)', value: 'id-desc' },
          { label: 'Name (A-Z)', value: 'name-asc' },
          { label: 'Name (Z-A)', value: 'name-desc' },
          { label: 'Start Time (Earliest)', value: 'starttime-asc' },
          { label: 'Start Time (Latest)', value: 'starttime-desc' },
          { label: 'End Time (Earliest)', value: 'endtime-asc' },
          { label: 'End Time (Latest)', value: 'endtime-desc' },
        ]}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />
      {promotions && promotions.length === 0 ? (
        <div className="no-entries">
          <p>No promotions available</p>
        </div>
      ) : (
        promotions?.map((promotion) => (
          <ItemBox
            key={promotion.id}
            title={`${promotion.name}`}
            description={`${promotion.type}`}
            navigateTo={`/promotions/${promotion.id}`}
            id={promotion.id}
            extraInfo={[
              { label: 'Start Time', value: promotion.startTime ? new Date(promotion.startTime).toLocaleDateString() : 'N/A' },
              { label: 'End Time', value: promotion.endTime ? new Date(promotion.endTime).toLocaleDateString() : 'N/A' },
              promotion.minSpending !== undefined ? { label: 'Min Spending', value: `$${promotion.minSpending}` } : null,
              promotion.rate !== undefined ? { label: 'Rate', value: `${promotion.rate}` } : null,
              promotion.points !== undefined ? { label: 'Points', value: promotion.points } : null
            ].filter(Boolean) as {label: string; value: string | number}[]}
          />
        ))
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        itemsPerPage={itemsPerPage}
        totalItems={totalPromotions}
      />
    </div>
  );
};

export default PromotionsPage;