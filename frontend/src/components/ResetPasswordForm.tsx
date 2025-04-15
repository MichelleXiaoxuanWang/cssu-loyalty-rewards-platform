// src/components/ResetPasswordForm.tsx
import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api.config';

interface ResetPasswordFormProps {
  resetToken: string;
  onResetSuccess: () => void;
  onError: (message: string) => void;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onResetSuccess, onError }) => {
  const [utorid, setUtorid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const resetToken = localStorage.getItem(`resetToken_${utorid}`);
//   const expiresAt = localStorage.getItem(`resetExpiresAt_${utorid}`);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    onError(''); // Clear any previous errors

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resets/${resetToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Payload includes UTORid and new password
        body: JSON.stringify({ utorid, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Password reset failed');
      }

      await response.json();
      onResetSuccess();
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
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="password">New Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%' }}
        />
      </div>
      <button type="submit" style={{ width: '100%' }} disabled={loading}>
        Reset
      </button>
    </form>
  );
};

export default ResetPasswordForm;
