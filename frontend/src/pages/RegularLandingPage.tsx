import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { getCurrentUser, User } from '../services/user.service';
import { getMyTransactions, Transaction } from '../services/transaction.service';
import TransactionCard from '../components/TransactionCard';
import './RegularLandingPage.css';

const RegularLandingPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Generate a random QR code value for the user (placeholder)
  const userId = localStorage.getItem('userId') || 'user';
  const qrCodeValue = `uoft-points-user-${userId}-${Date.now()}`;

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
          limit: 6 
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
      <div className="left-panel">
        <div className="points-card">
          <h2>My Points Balance</h2>
          <div className="points-amount">{user?.points || 0}</div>
          <div className="points-meta">
            <p>Last updated: {new Date().toLocaleString()}</p>
            <Link to="/transactions" className="view-transactions-link">
              View All Transactions
            </Link>
          </div>
        </div>
        
        <div className="qr-code-card">
          <h2>My QR Code</h2>
          <p>Use this code when making purchases to earn points</p>
          <div className="qr-code-container">
            <QRCode value={qrCodeValue} size={200} />
          </div>
          <p className="qr-instructions">
            Show this QR code to a cashier to earn points on your purchase
          </p>
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
          
          {/* TODO: Update this section when backend adds timestamp for proper sorting */}
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
