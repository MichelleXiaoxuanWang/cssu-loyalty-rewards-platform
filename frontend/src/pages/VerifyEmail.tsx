import React, {useState} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import VerifyEmailForm from '../components/VerifyEmailForm';

const VerifyEmailPage: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleResetSuccess = () =>{
        navigate('/resetPassword');
    };
    const handleError = (message: string) =>{
        setError(message);
    };

    return (
        <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Verify your email</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <VerifyEmailForm onResetSuccess={handleResetSuccess} onError={handleError} />
      
      <button onClick={() => navigate('/login')} style={{ marginTop: '1rem', width: '100%' }}>
        Back to Login
      </button>
      <p style={{ marginTop: '1rem' }}>
         <Link to="/resetPassword">Please check your email!</Link>
      </p>
    </div>
    );
};

export default VerifyEmailPage