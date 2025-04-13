import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import Form from '../components/Form';
import Pagination from '../components/Pagination';
import FilterAndSort from '../components/FilterAndSort';
import { fetchPromotions, updatePromotion, createPromotion } from '../services/promotion.service';
import '../App.css';

interface Promotion {
  id: number;
  name: string;
  description: string;
  type: string;
  startTime: string;
  endTime: string;
  minSpending?: number;
  rate?: number;
  points?: number;
}

const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [creatingPromotion, setCreatingPromotion] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const currentUser = localStorage.getItem('currentUser');
  const role = localStorage.getItem(`role_${currentUser}`);

  useEffect(() => {
    if (role === 'manager' || role === 'superuser') {
      const loadPromotions = async () => {
        try {
          const data = await fetchPromotions(currentPage, {}, '');
          setPromotions(data.promotions || []);
          setTotalPages(data.totalPages || 1);
        } catch (error) {
          console.error('Error loading promotions:', error);
          setPromotions([]);
        }
      };
      loadPromotions();
    }
  }, [currentPage, role]);

  const handleEdit = (promotion: any) => {
    setEditingPromotion(promotion);
  };

  const handleCreate = () => {
    setCreatingPromotion(true);
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      if (creatingPromotion) {
        await createPromotion(formData);
        setCreatingPromotion(false);
      } else if (editingPromotion) {
        await updatePromotion(editingPromotion.id, formData);
        setEditingPromotion(null);
      }
      const data = await fetchPromotions(currentPage, {}, '');
      setPromotions(data.promotions);
      setFeedbackMessage('Submission successful!');
    } catch (error) {
      setFeedbackMessage('Submission failed. Please try again.');
    }
  };

  const handleFilterChange = async (filter: { name?: string; type?: string; started?: boolean; ended?: boolean }) => {
    const data = await fetchPromotions(currentPage, filter, '');
    setPromotions(data.promotions);
    setTotalPages(data.totalPages);
  };

  const handleSortChange = async (sort: string) => {
    const data = await fetchPromotions(currentPage, {}, sort);
    setPromotions(data.promotions);
    setTotalPages(data.totalPages);
  };

  const handleLimitChange = async (newLimit: number) => {
    const data = await fetchPromotions(currentPage, {}, '', newLimit);
    setPromotions(data.promotions);
    setTotalPages(data.totalPages);
  };

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
              title={promotion.name}
              description={promotion.description}
              onClick={() => handleEdit(promotion)}
            />
          ))
        )}
      </div>
    );
  }

  return (
    <div>
      <h1>Promotions</h1>
      {feedbackMessage && <p style={{ color: feedbackMessage.includes('failed') ? 'red' : 'green' }}>{feedbackMessage}</p>}
      <button onClick={handleCreate}>Create New Promotion</button>
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
        sortOptions={[{ label: 'Name', value: 'name' }, { label: 'Discount', value: 'discount' }]}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        disabled={!Array.isArray(promotions) || promotions.length === 0}
      />
      {promotions && promotions.length === 0 ? (
        <div style={{ margin: '20px 0' }}>
          <p>There are currently no entries</p>
        </div>
      ) : (
        promotions?.map((promotion) => (
          <ItemBox
            key={promotion.id}
            title={promotion.name}
            description={promotion.description}
            onClick={() => handleEdit(promotion)}
          />
        ))
      )}
      {(editingPromotion) && (
        <Form
          fields={[
            { name: 'name', label: 'Name', type: 'text', value: editingPromotion?.name || '' },
            { name: 'description', label: 'Description', type: 'text', value: editingPromotion?.description || '' },
            { name: 'type', label: 'Type', type: 'select', options: ['automatic', 'one-time'], value: editingPromotion?.type || '' },
            { name: 'startTime', label: 'Start Time', type: 'datetime-local', value: editingPromotion?.startTime || '' },
            { name: 'endTime', label: 'End Time', type: 'datetime-local', value: editingPromotion?.endTime || '' },
            { name: 'minSpending', label: 'Minimum Spending', type: 'number', value: editingPromotion?.minSpending || 0},
            { name: 'rate', label: 'Rate', type: 'number', value: editingPromotion?.rate || 0 },
            { name: 'points', label: 'Points', type: 'number', value: editingPromotion?.points || 0 },
          ]}
          onSubmit={handleSubmit}
        />
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
};

export default PromotionsPage;