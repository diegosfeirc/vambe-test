'use client';

import { useState, useCallback, ChangeEvent } from 'react';
import { Search, X } from 'lucide-react';
import styles from './styles.module.css';
import { SearcherProps } from './interfaces';

export default function Searcher(props: SearcherProps) {
  const { 
    onSearchChange, 
    placeholder = 'Buscar por nombre de cliente...' 
  } = props;
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    onSearchChange(value);
  }, [onSearchChange]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    onSearchChange('');
  }, [onSearchChange]);

  return (
    <div className={styles.searcherContainer}>
      <div className={styles.searcherWrapper}>
        <div className={styles.searchIconWrapper}>
          <Search className={styles.searchIcon} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={styles.searchInput}
          aria-label="Buscar cliente por nombre"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className={styles.clearButton}
            aria-label="Limpiar búsqueda"
          >
            <X className={styles.clearIcon} />
          </button>
        )}
      </div>
    </div>
  );
}

