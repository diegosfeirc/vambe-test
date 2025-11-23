'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';
import styles from './styles.module.css';
import { threeSDescriptions } from '@/utils/three-s';
import { ThreeSTooltipProps } from './interfaces';

export default function ThreeSTooltip({ category }: ThreeSTooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const description = threeSDescriptions[category];

  return (
    <div
      className={styles.tooltipContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        className={styles.infoButton}
        aria-label={`Información sobre ${description.title}`}
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

