import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ResetPasswordForm from '../components/ResetPasswordForm';
import './ResetPasswordPage.css';

const ResetPasswordPage: React.FC = () => {
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
        <div className="reset-container">
            <h2>Reset Password</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            {/* Always render the form (resetToken passed here as an empty string as fallback) */}
            <ResetPasswordForm onResetSuccess={handleResetSuccess} onError={handleError} resetToken={""} />
            <p>
                <Link to="/login" className="back-link">Back to Login</Link>
            </p>
        </div>
    );
};

export default ResetPasswordPage;
