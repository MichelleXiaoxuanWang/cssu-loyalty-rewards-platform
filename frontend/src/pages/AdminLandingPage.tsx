import React, { useEffect, useState } from 'react';
import { 
  getEventStatistics,
  getPromotionStatistics,
  getUserStatistics,
  EventStatistics, 
  PromotionStatistics,
  UserStatistics
} from '../services/statistics.service';
import StatisticsCard from '../components/StatisticsCard';
import { useNavigate } from 'react-router-dom';
import './AdminLandingPage.css';

// Import icons (using text placeholders, you can replace with actual icons)
const EVENT_ICON = '📅';
const PROMOTION_ICON = '🏷️';
const USER_ICON = '👥';

// Default values for when API calls fail
const DEFAULT_EVENT_STATS: EventStatistics = {
  total: 0,
  ongoing: 0,
  upcoming: 0,
  ended: 0
};

const DEFAULT_PROMOTION_STATS: PromotionStatistics = {
  total: 0,
  ongoing: 0,
  automatic: 0,
  oneTime: 0
};

const DEFAULT_USER_STATS: UserStatistics = {
  total: 0,
  regular: 0,
  cashier: 0,
  manager: 0,
  superuser: 0
};

const AdminLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [eventStats, setEventStats] = useState<EventStatistics>(DEFAULT_EVENT_STATS);
  const [promotionStats, setPromotionStats] = useState<PromotionStatistics>(DEFAULT_PROMOTION_STATS);
  const [userStats, setUserStats] = useState<UserStatistics>(DEFAULT_USER_STATS);
  const [errors, setErrors] = useState<{
    events?: string;
    promotions?: string;
    users?: string;
  }>({});

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      // Fetch events statistics
      try {
        const events = await getEventStatistics();
        setEventStats(events);
      } catch (err) {
        console.error('Error fetching event statistics:', err);
        setErrors(prev => ({ ...prev, events: 'Failed to load event statistics' }));
      }
      
      // Fetch promotions statistics
      try {
        const promotions = await getPromotionStatistics();
        setPromotionStats(promotions);
      } catch (err) {
        console.error('Error fetching promotion statistics:', err);
        setErrors(prev => ({ ...prev, promotions: 'Failed to load promotion statistics' }));
      }
      
      // Fetch user statistics
      try {
        const users = await getUserStatistics();
        setUserStats(users);
      } catch (err) {
        console.error('Error fetching user statistics:', err);
        setErrors(prev => ({ ...prev, users: 'Failed to load user statistics' }));
      }
      
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="admin-loading">Loading statistics...</div>;
  }

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="admin-landing-page">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>View and manage system statistics</p>
      </header>

      {Object.keys(errors).length > 0 && (
        <div className="admin-errors">
          {Object.entries(errors).map(([key, message]) => (
            <div key={key} className="admin-error">
              {message}
            </div>
          ))}
        </div>
      )}

      <div className="admin-stats-container">
        {/* Events Statistics */}
        <div className="stat-card-wrapper" onClick={() => handleNavigate('/events')}>
          <StatisticsCard
            title="Events"
            icon={EVENT_ICON}
            colorClass="events-color"
            items={[
              { label: 'Total Events', value: eventStats.total },
              { label: 'Ongoing Events', value: eventStats.ongoing },
              { label: 'Upcoming Events', value: eventStats.upcoming },
              { label: 'Ended Events', value: eventStats.ended },
            ]}
          />
        </div>

        {/* Promotions Statistics */}
        <div className="stat-card-wrapper" onClick={() => handleNavigate('/promotions')}>
          <StatisticsCard
            title="Active Promotions"
            icon={PROMOTION_ICON}
            colorClass="promotions-color"
            items={[
              { label: 'Total', value: promotionStats.ongoing },
              { label: 'Automatic', value: promotionStats.automatic },
              { label: 'One-Time', value: promotionStats.oneTime },
            ]}
          />
        </div>

        {/* User Statistics */}
        <div className="stat-card-wrapper" onClick={() => handleNavigate('/users')}>
          <StatisticsCard
            title="Users"
            icon={USER_ICON}
            colorClass="users-color"
            items={[
              { label: 'Regular Users', value: userStats.regular },
              { label: 'Cashier', value: userStats.cashier },
              { label: 'Manager', value: userStats.manager },
              { label: 'Superuser', value: userStats.superuser },
            ]}
          />
        </div>

        {/* Action Buttons - Now inside the grid container */}
        <div className="admin-action-buttons">
          <button 
            className="admin-action-button" 
            onClick={() => handleNavigate('/create-user')}
          >
            Create User
          </button>
          <button 
            className="admin-action-button" 
            onClick={() => handleNavigate('/transactions')}
          >
            Manage Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLandingPage;
