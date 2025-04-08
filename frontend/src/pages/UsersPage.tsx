import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import Form from '../components/Form';
import Pagination from '../components/Pagination';
import FilterAndSort from '../components/FilterAndSort';
import { fetchUsers, updateUser, createUser } from '../services/user.service';

interface User {
  id: number;
  name: string;
  role: string;
  verified: boolean;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const loadUsers = async () => {
      const data = await fetchUsers(currentPage, {}, '');
      setUsers(data.users);
      setTotalPages(data.totalPages);
    };
    loadUsers();
  }, [currentPage]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    if (editingUser) {
      await updateUser(editingUser.id, formData);
    } else {
      await createUser(formData);
    }
    setEditingUser(null);
    const data = await fetchUsers(currentPage, {}, '');
    setUsers(data.users);
  };

  const handleFilterChange = async (filter: { name?: string; role?: string; verified?: boolean; activated?: boolean }) => {
    const data = await fetchUsers(currentPage, filter, '');
    setUsers(data.users);
    setTotalPages(data.totalPages);
  };

  const handleSortChange = async (sort: string) => {
    const data = await fetchUsers(currentPage, {}, sort);
    setUsers(data.users);
    setTotalPages(data.totalPages);
  };

  const handleLimitChange = async (newLimit: number) => {
    const data = await fetchUsers(currentPage, {}, '', newLimit);
    setUsers(data.users);
    setTotalPages(data.totalPages);
  };

  return (
    <div>
      <h1>Users Page</h1>
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
      {users.length === 0 ? (
        <div style={{ margin: '20px 0' }}>
          <p>There are currently no entries</p>
        </div>
      ) : (
        users.map((user) => (
          <ItemBox
            key={user.id}
            title={user.name}
            description={`Role: ${user.role}, Verified: ${user.verified}`}
            onClick={() => handleEdit(user)}
          />
        ))
      )}
      {editingUser && (
        <Form
          fields={[
            { name: 'name', label: 'Name', type: 'text', value: editingUser.name },
            { name: 'role', label: 'Role', type: 'select', value: editingUser.role },
            { name: 'verified', label: 'Verified', type: 'checkbox', value: editingUser.verified },
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

export default UsersPage;
