// src/pages/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ResetPasswordForm from '../components/ResetPasswordForm';

const ResetPasswordPage: React.FC = () => {
  // Fallback to an empty string if no token is provided
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleResetSuccess = () => {
    setSuccess('Password reset successful! Redirecting to login...');
    setTimeout(() => {
      navigate('/login');
    }, 3000);
  };

  const handleError = (message: string) => {
    setError(message);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Reset Password</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {/* Always render the form with the token (empty string if not provided) */}
      <ResetPasswordForm
        onResetSuccess={handleResetSuccess}
        onError={handleError} resetToken={''}      />
      <p style={{ marginTop: '1rem' }}>
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
};

export default ResetPasswordPage;
