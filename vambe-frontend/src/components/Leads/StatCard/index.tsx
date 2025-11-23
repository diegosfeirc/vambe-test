'use client';

import styles from './styles.module.css';
import { StatCardProps } from './interfaces';

export default function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIconWrapper}>
        <Icon className={styles.statIcon} />
      </div>
      <div className={styles.statContent}>
        <p className={styles.statLabel}>{label}</p>
        <p className={styles.statValue}>{value}</p>
      </div>
    </div>
  );
}

