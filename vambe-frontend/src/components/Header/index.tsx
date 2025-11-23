'use client';

import styles from './styles.module.css';
import { HeaderProps } from './interfaces';

export default function Header(props: HeaderProps) {
  const { title, subtitle, titleIcon: TitleIcon } = props;

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerTitleSection}>
          <div className={styles.titleWrapper}>
            {TitleIcon && <TitleIcon className={styles.titleIcon} />}
            <h1 className={styles.title}>{title}</h1>
          </div>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>
      </div>
    </header>
  );
}

