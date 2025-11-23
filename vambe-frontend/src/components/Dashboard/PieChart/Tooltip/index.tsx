'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import { CategoryTooltipProps } from './interfaces';
import styles from './styles.module.css';
import { categoryDescriptions } from '@/utils/tooltip';

export default function CategoryTooltip({ title }: CategoryTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const description = categoryDescriptions[title];

  if (!description) {
    return null;
  }

  return (
    <div 
      className={styles.tooltipContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button 
        className={styles.infoButton}
        aria-label={`Información sobre ${title}`}
        type="button"
      >
        <Info size={18} />
      </button>
      {isHovered && (
        <div className={styles.tooltipContent}>
          <h4 className={styles.tooltipTitle}>{description.title}</h4>
          <p className={styles.tooltipDescription}>{description.description}</p>
        </div>
      )}
    </div>
  );
}

