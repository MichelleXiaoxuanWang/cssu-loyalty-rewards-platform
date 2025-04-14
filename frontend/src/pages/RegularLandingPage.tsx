import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { getCurrentUser, User } from '../services/user.service';
import { getMyTransactions, Transaction } from '../services/transaction.service';
import { isUserVerified, getUserId, getUserUtorid } from '../services/auth.service';
import TransactionCard from '../components/TransactionCard';
import './RegularLandingPage.css';

const RegularLandingPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check user verification status
  const userVerified = isUserVerified();
  
  // Generate a random QR code value for the user (placeholder)
  const userId = getUserId();
  const utorid = getUserUtorid();
  const qrCodeValue = `uoft-points-user-${userId}-${utorid}-${Date.now()}`;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user data
        const userData = await getCurrentUser();
        setUser(userData);
        
        // Fetch recent transactions
        const transactionsResponse = await getMyTransactions({ 
          page: 1, 
          limit: 5,
          sort: 'id-desc'  // Sort by ID in descending order to get the most recent ones
        });
        setRecentTransactions(transactionsResponse.results);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load your information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="regular-landing-page">
      {!userVerified && (
        <div className="verification-notice">
          <div className="verification-content">
            <h3>Account Not Verified</h3>
            <p>Your account has not been verified by a manager yet. Until verification, you cannot transfer or redeem points. Please wait for a manager to verify your information.</p>
          </div>
        </div>
      )}
      
      <div className="left-panel">
        <div className="points-card">
          <h2>My Points Balance</h2>
          <div className="points-amount">{user?.points || 0}</div>
          <div className="points-meta">
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
        </div>
        
        <div className="qr-code-card">
          <h2>My QR Code</h2>
          <p>Show this QR code to a cashier to earn points on your purchase</p>
          <div className="qr-code-container">
            <QRCode value={qrCodeValue} size={200} />
          </div>
          <div className="user-identifiers">
            <h2>My IDs</h2>
            <p>You can also use these IDs for transactions and activities</p>
            <div className="regular-id-container">
              <p>User ID: {userId}</p>
              <p>UTORid: {utorid}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="right-panel">
        <div className="recent-transactions">
          <div className="transactions-header">
            <h2>Recent Transactions</h2>
            <Link to="/transactions" className="see-all-link">
              See All
            </Link>
          </div>
          
          {recentTransactions.length === 0 ? (
            <div className="no-transactions">
              <p>No recent transactions found.</p>
            </div>
          ) : (
            <div className="transactions-list">
              {recentTransactions.map(transaction => (
                <TransactionCard 
                  key={transaction.id}
                  transaction={transaction} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegularLandingPage;
