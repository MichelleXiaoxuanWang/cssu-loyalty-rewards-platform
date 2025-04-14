import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import Form from '../components/Form';
import Pagination from '../components/Pagination';
import FilterAndSort from '../components/FilterAndSort';
import { fetchUsers, updateUser, createUser, User, UserFilters, UserResponse } from '../services/user.service';
import '../App.css';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10
  });
  const currentUser = localStorage.getItem('currentUser');
  const role = localStorage.getItem(`current_role_${currentUser}`);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const response: UserResponse = await fetchUsers(filters);
        setUsers(response.results);
        setTotalUsers(response.count);
        setCurrentPage(filters.page || 1);
        setItemsPerPage(filters.limit || 10);
      } catch (err) {
        setError('Failed to load users. Please try again later.');
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [currentPage, filters, role]);

  const handleFilterChange = async (newFilters: UserFilters) => {
    setFilters({ ...newFilters, page: 1 });
  };

  const handleSortChange = async (sort: string) => {
    const data = await fetchUsers(filters);
    setUsers(data.results);
    setTotalUsers(data.count);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (newLimit: number) => {
    setFilters(prev => ({ ...prev, page: 1, limit: newLimit }));
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  if (role === 'regular' || role === 'cashier') {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h1>Users</h1>
      <FilterAndSort
        filters={[
          { label: 'Name', value: 'name' },
          { label: 'Role', value: 'role', options: ['regular', 'cashier', 'manager', 'superuser'] },
          { label: 'Verified', value: 'verified', options: ['true', 'false'] },
          { label: 'Activated', value: 'activated', options: ['true', 'false'] },
        ]}
        sortOptions={[{ label: 'Name', value: 'name' }, { label: 'Role', value: 'role' }]}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />
      {users && users.length === 0 ? (
        <div className="no-entries">
          <p>There are currently no users</p>
        </div>
      ) : (
        users.map((user) => (
          <ItemBox
            key={user.id}
            title={`ID: ${user.id} - Name: ${user.name}`}
            description={`Role: ${user.role}, Verified: ${user.verified}`}
            navigateTo={`/users/${user.id}`}
          />
        ))
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
};

export default UsersPage;
