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

  return (
    <div className="item-box" onClick={handleClick}>
      <h3>{title}</h3>
      {description && (
        <p className={`description ${description === 'Not Published' ? 'unpublished' : 'published'}`}>
          {description}
        </p>
      )}
      {details && (
        <p className="item-details">{details}</p>
      )}
      {verified && (
        <p className={`description ${verified === 'Not Verified' ? 'unpublished' : 'published'}`}>
          {verified}
        </p>
      )}
    </div>
  );
};

export default ItemBox;