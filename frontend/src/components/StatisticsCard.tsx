import React from 'react';
import './StatisticsCard.css';

// Define stat item interface
interface StatItem {
  label: string;
  value: number;
}

// Props for the StatisticsCard component
interface StatisticsCardProps {
  title: string;
  icon: React.ReactNode;
  items: StatItem[];
  colorClass: string;
}

/**
 * A reusable card component for displaying statistics
 */
const StatisticsCard: React.FC<StatisticsCardProps> = ({ 
  title,
  icon,
  items,
  colorClass
}) => {
  return (
    <div className="statistics-card">
      <div className="statistics-card-header">
        <div className={`statistics-card-icon ${colorClass}`}>
          {icon}
        </div>
        <h3 className="statistics-card-title">{title}</h3>
      </div>
      <div className="statistics-card-content">
        {items.map((item, index) => (
          <div key={index} className="statistics-item">
            <div className="statistics-item-label">{item.label}</div>
            <div className="statistics-item-value">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatisticsCard;
