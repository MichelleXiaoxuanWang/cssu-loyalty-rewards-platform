import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import VerifyEmailForm from '../components/VerifyEmailForm';
import './VerifyEmailPage.css';

const VerifyEmailPage: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleResetSuccess = () => {
        navigate('/resetPassword');
    };

    const handleError = (message: string) => {
        setError(message);
    };

    return (
        <div className="verify-container">
            <h2>Verify your email</h2>
            {error && <p className="error-message">{error}</p>}
            <VerifyEmailForm onResetSuccess={handleResetSuccess} onError={handleError} />

            <button onClick={() => navigate('/login')}>
                Back to Login
            </button>
            <p>
                <Link to="/resetPassword">Please check your email!</Link>
            </p>
        </div>
    );
};

export default VerifyEmailPage;
