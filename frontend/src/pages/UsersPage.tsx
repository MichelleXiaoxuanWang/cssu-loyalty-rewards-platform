import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import Pagination from '../components/Pagination';
import FilterAndSort from '../components/FilterAndSort';
import { fetchUsers, User, UserFilters, UserResponse } from '../services/user.service';
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
    limit: 5
  });
  const currentUser = localStorage.getItem('currentUser');
  const role = localStorage.getItem(`current_role_${currentUser}`);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const response: UserResponse = await fetchUsers(filters);
        let fetchedUsers = response.results;

        // Apply sorting after fetching
        if (filters.sort) {
          fetchedUsers = fetchedUsers.sort((a, b) => {
            switch (filters.sort) {
              case 'id-asc':
                return a.id - b.id;
              case 'id-desc':
                return b.id - a.id;
              case 'utorid-asc':
                return a.utorid.localeCompare(b.utorid);
              case 'utorid-desc':
                return b.utorid.localeCompare(a.utorid);
              case 'name-asc':
                return a.name.localeCompare(b.name);
              case 'name-desc':
                return b.name.localeCompare(a.name);
              default:
                return 0;
            }
          });
        }

        setUsers(fetchedUsers);
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

    loadUsers();
  }, [filters, role]);

  const handleFilterChange = async (newFilters: UserFilters) => {
    setFilters({ ...newFilters, page: 1 });
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
        sortOptions={[
          { label: 'ID (Ascending)', value: 'id-asc' },
          { label: 'ID (Descending)', value: 'id-desc' },
          { label: 'UTORID (A-Z)', value: 'utorid-asc' },
          { label: 'UTORID (Z-A)', value: 'utorid-desc' },
          { label: 'Name (A-Z)', value: 'name-asc' },
          { label: 'Name (Z-A)', value: 'name-desc' },
        ]}
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
      />
    </div>
  );
};

export default UsersPage;
