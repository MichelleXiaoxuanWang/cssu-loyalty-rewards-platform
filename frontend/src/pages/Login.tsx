import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

 //TODO: modify this part to navigate to the correct page.
  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const handleError = (message: string) => {
    setError(message);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <LoginForm onLoginSuccess={handleLoginSuccess} onError={handleError} />
      <p style={{ marginTop: '1rem' }}>
        Forget Password? <Link to="/verifyEmail">Change your password here!!</Link>
      </p>
    </div>
  );
};

export default LoginPage;
