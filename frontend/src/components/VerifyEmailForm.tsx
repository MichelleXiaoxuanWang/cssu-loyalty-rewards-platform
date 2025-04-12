import React, {useState} from 'react';

interface ResetFormProps{
    onResetSuccess: ()=>void;
    onError: (message: string) => void;
}

const VerifyEmailForm: React.FC<ResetFormProps> = ({ onResetSuccess, onError})=>{
    const [utorid, setUtorid] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        setLoading(true);
        onError('');
        try{
            const response = await fetch('http://localhost:8000/auth/resets', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ utorid})
            });
            if (!response.ok) {
                const data = await response.json();
                // If the error message indicates that the user is not found, customize the message
                if (data.error && data.error.toLowerCase().includes('user does not exist')) {
                  throw new Error('Utorid not exists');
                }
                throw new Error(data.error || 'Request failed');
              }
            const data = await response.json();
            // Save resetToken (and optionally expiresAt) to localStorage
            localStorage.setItem(`resetToken_${utorid}`, data.resetToken);
            // localStorage.setItem(`resetExpiresAt_${utorid}`, data.expiresAt);
            alert('Email sent!');
            onResetSuccess();
        } catch (error: any) {
            onError(error.message);
        } finally {
        setLoading(false);
        }       
    };


    return (
        <form onSubmit={handleSubmit} style={({width: '100%'})}>
            <div style={{marginBottom: '1rem'}}>
                <label htmlFor="utorid">UTORid:</label>
                <input 
                    type="text"
                    id="utorid"
                    value={utorid}
                    onChange={(e)=>setUtorid(e.target.value)}
                    required
                    style={{ width: '100%' }}/>

            </div>
            <button type="submit" style={{ width: '100%' }} disabled={loading}>
                Send
            </button>
        </form>
    );
};

export default VerifyEmailForm;