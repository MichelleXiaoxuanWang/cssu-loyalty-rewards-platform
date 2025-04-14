import React, { useState } from 'react';
import { API_BASE_URL } from '../config/api.config';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onError: (message: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onError }) => {
  const [utorid, setUtorid] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    onError(''); // clear previous errors

    try {
      const response = await fetch(`${API_BASE_URL}/auth/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ utorid, password })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      // Save the token, token expiration, and the highest role in localStorage
      localStorage.setItem(`resetExpiresAt_${utorid}`, data.expiresAt);
      localStorage.setItem(`token_${utorid}`, data.token);
      localStorage.setItem(`role_${utorid}`, data.userRole);
      localStorage.setItem(`current_role_${utorid}`, data.userRole);  // the current role that the user choose to use (when login, default is the highest role)
      localStorage.setItem(`userId_${utorid}`, data.userId);
      localStorage.setItem(`userName_${utorid}`, data.userName);
      localStorage.setItem(`currentUser`, utorid);

      onLoginSuccess();
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
        <label htmlFor="password">Password:</label>
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
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
};

export default LoginForm;
