import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Navigate to home page after successful login
    const handleLoginSuccess = () => {
        navigate('/'); // This will trigger the HomeRedirect component in App.tsx
    };

    const handleError = (message: string) => {
        setError(message);
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}
            <LoginForm onLoginSuccess={handleLoginSuccess} onError={handleError} />
            <p>
               <Link to="/verifyEmail">Change/set your password here!!</Link>
            </p>
        </div>
    );
};

export default LoginPage;
