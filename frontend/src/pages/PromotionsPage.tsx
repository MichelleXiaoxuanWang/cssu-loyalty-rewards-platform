import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import Form from '../components/Form';
import Pagination from '../components/Pagination';
import FilterAndSort from '../components/FilterAndSort';
import { fetchPromotions, updatePromotion, createPromotion } from '../services/promotion.service';

interface Promotion {
  id: number;
  title: string;
  description: string;
}

const PromotionsPage: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [creatingPromotion, setCreatingPromotion] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadPromotions = async () => {
      const data = await fetchPromotions(currentPage, {}, '');
      setPromotions(data.promotions);
      setTotalPages(data.totalPages);
    };
    loadPromotions();
  }, [currentPage]);

  const handleEdit = (promotion: any) => {
    setEditingPromotion(promotion);
  };

  const handleCreate = () => {
    setCreatingPromotion(true);
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    if (creatingPromotion) {
      await createPromotion(formData);
      setCreatingPromotion(false);
    } else if (editingPromotion) {
      await updatePromotion(editingPromotion.id, formData);
      setEditingPromotion(null);
    }
    const data = await fetchPromotions(currentPage, {}, '');
    setPromotions(data.promotions);
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

  return (
    <div>
      <h1>Promotions Page</h1>
      <button onClick={handleCreate}>Create New Promotion</button>
      <FilterAndSort
        filters={[
          { label: 'Name', value: 'name' },
          { label: 'Type', value: 'type', options: ['automatic', 'one-time'] },
          { label: 'Started', value: 'started', options: ['true', 'false'] },
          { label: 'Ended', value: 'ended', options: ['true', 'false'] },
        ]}
        sortOptions={[{ label: 'Title', value: 'title' }, { label: 'Discount', value: 'discount' }]}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />
      {promotions.length === 0 ? (
        <div style={{ margin: '20px 0' }}>
          <p>There are currently no entries</p>
        </div>
      ) : (
        promotions.map((promo) => (
          <ItemBox
            key={promo.id}
            title={promo.title}
            description={promo.description}
            onClick={() => handleEdit(promo)}
          />
        ))
      )}
      {(editingPromotion || creatingPromotion) && (
        <Form
          fields={[
            { name: 'title', label: 'Title', type: 'text', value: editingPromotion?.title || '' },
            { name: 'description', label: 'Description', type: 'text', value: editingPromotion?.description || '' },
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