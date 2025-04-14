import React, { useState, useEffect } from 'react';
import ItemBox from '../components/ItemBox';
import Form from '../components/Form';
import Pagination from '../components/Pagination';
import FilterAndSort from '../components/FilterAndSort';
import { fetchUsers, updateUser, createUser } from '../services/user.service';
import '../App.css';

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
  const currentUser = localStorage.getItem('currentUser');
  const role = localStorage.getItem(`current_role_${currentUser}`);

  useEffect(() => {
    if (role === 'manager' || role === 'superuser') {
      const loadUsers = async () => {
        try {
          const data = await fetchUsers(currentPage, {}, '');
          setUsers(data.users || []);
          setTotalPages(data.totalPages || 1);
        } catch (error) {
          console.error('Error loading users:', error);
          setUsers([]);
        }
      };
      loadUsers();
    }
  }, [currentPage, role]);

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

  if (role === 'regular') {
    return <div>Access Denied</div>;
  }

  if (role === 'cashier') {
    return (
      <div>
        <h1>Create New User</h1>
        <Form
          fields={[
            { name: 'name', label: 'Name', type: 'text' },
            { name: 'role', label: 'Role', type: 'select', options: ['regular', 'cashier']},
            { name: 'email', label: 'Email', type: 'email' },
          ]}
          onSubmit={handleSubmit}
        />
      </div>
    );
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
        disabled={users.length === 0}
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
