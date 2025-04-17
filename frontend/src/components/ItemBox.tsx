import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ItemBox.css';

interface ItemBoxProps {
  title: string;
  description?: string;
  details?: string;
  verified?: string;
  navigateTo?: string;
  id?: number | string;
  createdAt?: string;
  createdBy?: string;
  extraInfo?: {
    label: string;
    value: string | number;
  }[];
}

const ItemBox: React.FC<ItemBoxProps> = ({ 
  title, 
  description, 
  details, 
  verified, 
  navigateTo,
  id,
  createdAt,
  createdBy,
  extraInfo = []
}) => {
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

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          {/* First row of info */}
          <div className="item-info-row">
            {id && (
              <span className="item-detail">ID: {id}</span>
            )}
            {details && (
              <span className="item-detail">Role: {details}</span>
            )}
            {description && !['Published', 'Not Published', 'automatic', 'one-time'].includes(description) && (
              <span className="item-detail">Type: {description}</span>
            )}
            
            {/* Display any extra info items */}
            {extraInfo.map((info, index) => (
              <span key={index} className="item-detail">
                {info.label}: {info.value}
              </span>
            ))}
          </div>

          {/* Second row of info (if date or created by exists) */}
          {(createdAt || createdBy) && (
            <div className="item-info-row">
              {createdAt && (
                <span className="item-detail">Date: {formatDate(createdAt)}</span>
              )}
              {createdBy && (
                <span className="item-detail">Created by: {createdBy}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemBox;