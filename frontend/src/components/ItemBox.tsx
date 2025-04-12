import React from 'react';
import './ItemBox.css';

type ItemBoxProps = {
  title: string;
  description: string;
  onClick: () => void;
};

const ItemBox: React.FC<ItemBoxProps> = ({ title, description, onClick }) => {
  return (
    <div className="item-box" onClick={onClick}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default ItemBox;