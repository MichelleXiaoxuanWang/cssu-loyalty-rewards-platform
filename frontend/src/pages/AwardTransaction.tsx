// src/pages/AwardEventTransactionPage.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api.config';

interface TransactionResponse {
  id: number;
  recipient: string;
  awarded: number;
  type: string;
  relatedId: number;
  remark?: string;
  createdBy: string;
}

const AwardEventTransactionPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // Form fields:
  const [utorid, setUtorid] = useState<string>(''); // Optional field for specifying a single guest
  const [amount, setAmount] = useState<number>(0);
  const [remark, setRemark] = useState<string>('');

  // For feedback
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Retrieve current user's token and currentUser from localStorage
  const currentUser = localStorage.getItem('currentUser');
  const token = currentUser ? localStorage.getItem(`token_${currentUser}`) : '';

  // Handler for awarding points (submitting the form)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage('');
    setLoading(true);

    // Construct the payload
    // Always set type to "event"
    const payload: any = {
      type: "event",
      amount,
      remark: remark || undefined, // If remark is empty, omit it.
    };
    if (utorid.trim() !== '') {
      payload.utorid = utorid.trim();
    }

    try {
      const response = await fetch(`${API_BASE_URL}/events/${eventId}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create reward transaction');
      }
      const data: TransactionResponse | TransactionResponse[] = await response.json();
      
      // If data is an array, display a message for multiple transactions.
      if (Array.isArray(data)) {
        setMessage(`Awarded ${amount} points to ${data.length} guest(s).`);
      } else {
        setMessage(`Awarded ${data.awarded} points to ${data.recipient}.`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem', border: '1px solid #ddd' }}>
      <h1>Award Points to Guest(s) for Event (ID: {eventId})</h1>
      <p>
        <em>
          If you leave the UTORid field empty, points will be awarded to all guests.
        </em>
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="utorid"><strong>Guest UTORid (optional):</strong></label>
          <input
            type="text"
            id="utorid"
            value={utorid}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUtorid(e.target.value)}
            style={{ width: '100%' }}
            placeholder="e.g., johndoe1 (leave blank to award all guests)"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="amount"><strong>Points to Award:</strong></label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setAmount(Number(e.target.value))}
            style={{ width: '100%' }}
            required
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="remark"><strong>Remark (optional):</strong></label>
          <input
            type="text"
            id="remark"
            value={remark}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setRemark(e.target.value)}
            style={{ width: '100%' }}
            placeholder="e.g., Trivia winner"
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Awarding Points...' : 'Award Points'}
        </button>
      </form>
      {message && <p style={{ color: 'green', marginTop: '1rem' }}>{message}</p>}
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      <button onClick={() => navigate(`/events/${eventId}`)} style={{ marginTop: '1rem' }}>
        Back to Event Details
      </button>
    </div>
  );
};

export default AwardEventTransactionPage;
