import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ItemBox.css';

interface ItemBoxProps {
  title: string;
  description: string;
  navigateTo?: string;
}

const ItemBox: React.FC<ItemBoxProps> = ({ title, description, navigateTo }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <div className="item-box" onClick={handleClick}>
      <h3>{title}</h3>
      <p className={`description ${description === 'Published' ? 'published' : 'unpublished'}`}>
        {description}
      </p>
    </div>
  );
};

export default ItemBox;