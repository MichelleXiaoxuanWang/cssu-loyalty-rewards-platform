import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import Pagination from '../components/Pagination';
import FilterAndSort from '../components/FilterAndSort';
import { fetchUsers, User, UserFilters, UserResponse } from '../services/user.service';
import '../styles/ListingPage.css';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  // const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 5
  });
  const currentUser = localStorage.getItem('currentUser');
  const role = localStorage.getItem(`current_role_${currentUser}`);
  const isAdminRole = role === 'manager' || role === 'superuser';
  const [hasUnverifiedUser, setHasUnverifiedUser] = useState(false);

  useEffect(() => {
    if (isAdminRole) {
      checkSystemAlerts();
    }
  }, [isAdminRole]);

  const checkSystemAlerts = async () => {
    try {
      // Get first page with high limit to efficiently check for alerts
      const alertCheckFilters: UserFilters = { 
        page: 1, 
        limit: 100, 
        verified: false 
      };
      
      // Check for suspicious transactions
      const unverifiedCheck: UserResponse = await fetchUsers(alertCheckFilters);
      setHasUnverifiedUser(unverifiedCheck.count > 0);
    } catch (err) {
      console.error('Error checking system alerts:', err);
    }
  };

  useEffect(() => {
    const loadUsers = async () => {
      // setLoading(true);
      try {
        const response: UserResponse = await fetchUsers(filters);
        setUsers(response.results);
        setTotalUsers(response.count);
        setCurrentPage(filters.page || 1);
        setItemsPerPage(filters.limit || 10);
      } catch (err) {
        // setError('Failed to load users. Please try again later.');
        console.error('Error fetching users:', err);
      } finally {
        // setLoading(false);
      }
    };

    loadUsers();
  }, [filters, role]);

  const handleFilterChange = async (newFilters: UserFilters) => {
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

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  if (role === 'regular' || role === 'cashier') {
    return <div>Access Denied</div>;
  }

  return (
    <div className="listing-page">
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

      {isAdminRole && (
        <div className="transactions-alerts">
          {hasUnverifiedUser && (
            <div className="pending-redemptions-alert">
              🔔 Some users are unverified
            </div>
          )}
        </div>
      )}

      {users && users.length === 0 ? (
        <div className="no-entries">
          <p>There are currently no users</p>
        </div>
      ) : (
        users.map((user) => (
          <ItemBox
            key={user.id}
            title={`${user.name}`}
            verified={`${user.verified ? 'Verified' : 'Not Verified'}`}
            details={`${user.role}`}
            navigateTo={`/users/${user.id}`}
            id={user.id}
            extraInfo={[
              { label: 'UTORid', value: user.utorid },
              user.email ? { label: 'Email', value: user.email } : null,
              { label: 'Points', value: user.points },
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
        totalItems={totalUsers}
      />
    </div>
  );
};

export default UsersPage;
