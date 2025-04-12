// src/components/CreateUserForm.tsx
import React, { useState } from 'react';

interface CreateUserFormProps {
  onUserCreated: (user: any) => void; // You can later define a proper type for the user
  onError: (message: string) => void;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({ onUserCreated, onError }) => {
  const [utorid, setUtorid] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    onError(''); // Clear previous errors
    const currentUser = localStorage.getItem("currentUser");
    try {
      const response = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          //TODO: might need to change how to get current user based
          'Authorization': `Bearer ${localStorage.getItem(`token_${currentUser}`) || ''}`
        },
        body: JSON.stringify({ utorid, name, email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }

      const data = await response.json();
      // data should contain: { id, utorid, name, email, verified, expiresAt, resetToken }
      onUserCreated(data);
    } catch (error: any) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="utorid">UTORid:</label>
        <input
          type="text"
          id="utorid"
          value={utorid}
          onChange={(e) => setUtorid(e.target.value)}
          required
          maxLength={8}
          style={{ width: '100%' }}
          placeholder="e.g., johndoe1"
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={1}
          maxLength={50}
          style={{ width: '100%' }}
          placeholder="John Doe"
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="email">UofT Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%' }}
          placeholder="john.doe@mail.utoronto.ca"
        />
      </div>
      <button type="submit" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default CreateUserForm;
