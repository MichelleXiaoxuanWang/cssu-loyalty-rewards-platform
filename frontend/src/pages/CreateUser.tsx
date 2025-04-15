// src/pages/CreateUserPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CreateUserForm from '../components/CreateUserForm.tsx';

const CreateUserPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<any>(null);
  // const navigate = useNavigate();

  const handleUserCreated = (user: any) => {
    setCreatedUser(user);
    setSuccessMsg(`User created successfully! Activation token: ${user.resetToken}`);
    // Optionally, navigate to a confirmation or login page after a delay:
    // setTimeout(() => navigate('/login'), 3000);
  };

  const handleError = (message: string) => {
    setError(message);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Create User</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
      {!createdUser && (
        <CreateUserForm onUserCreated={handleUserCreated} onError={handleError} />
      )}
      {createdUser && (
        <div style={{ marginTop: '1rem' }}>
          <p>User ID: {createdUser.id}</p>
          <p>UTORid: {createdUser.utorid}</p>
          <p>Name: {createdUser.name}</p>
          <p>Email: {createdUser.email}</p>
          <p>Verified: {createdUser.verified ? 'Yes' : 'No'}</p>
          <p>Activation token (resetToken): {createdUser.resetToken}</p>
          <p>Expires At: {createdUser.expiresAt}</p>
        </div>
      )}
      <p style={{ marginTop: '1rem' }}>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
};

export default CreateUserPage;
