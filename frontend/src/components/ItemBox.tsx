import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ItemBox.css';

interface ItemBoxProps {
  title: string;
  description?: string;
  details?: string;
  verified?: string;
  navigateTo?: string;
}

const ItemBox: React.FC<ItemBoxProps> = ({ title, description, details, verified, navigateTo }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  // Determine the correct item type class based on navigateTo path
  const getItemTypeClass = () => {
    if (!navigateTo) return '';
    if (navigateTo.includes('/promotions/')) return 'promotion';
    if (navigateTo.includes('/events/')) return 'event';
    if (navigateTo.includes('/users/')) return 'user';
    return '';
  };

  // Get status tag for published/unpublished
  const getPublishedStatus = () => {
    if (!description) return null;
    if (description.includes('Published') && !description.includes('Not Published')) {
      return <span className="status-tag published-tag">Published</span>;
    }
    if (description.includes('Not Published')) {
      return <span className="status-tag unpublished-tag">Not Published</span>;
    }
    return null;
  };

  // Get status tag for promotion types
  const getPromotionTypeTag = () => {
    if (!description) return null;
    if (description === 'automatic') {
      return <span className="status-tag automatic-tag">Automatic</span>;
    }
    if (description === 'one-time') {
      return <span className="status-tag one-time-tag">One-time</span>;
    }
    return null;
  };

  // Get status tag for verified/unverified
  const getVerifiedStatus = () => {
    if (!verified) return null;
    if (verified.includes('Verified') && !verified.includes('Not Verified')) {
      return <span className="status-tag verified-tag">Verified</span>;
    }
    if (verified.includes('Not Verified')) {
      return <span className="status-tag unverified-tag">Not Verified</span>;
    }
    return null;
  };

  return (
    <div className={`item-box ${getItemTypeClass()}`} onClick={handleClick}>
      <div className="item-content">
        <div className="item-header">
          <div className="item-title-container">
            <h3>{title}</h3>
            <div className="item-status-indicators">
              {getPublishedStatus()}
              {getPromotionTypeTag()}
              {getVerifiedStatus()}
            </div>
          </div>
        </div>
        
        <div className="item-info">
          <div className="item-info-row">
            {details && (
              <span className="item-detail">{details}</span>
            )}
            {description && !['Published', 'Not Published', 'automatic', 'one-time'].includes(description) && (
              <span className="item-detail">{description}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemBox;