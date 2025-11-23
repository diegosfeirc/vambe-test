'use client';

import { useState, useEffect, useRef } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './styles.module.css';
import { DashboardFiltersProps } from './interfaces';

function FilterSection({ 
  title, 
  options, 
  selectedOptions, 
  onChange, 
  type = 'checkbox',
  isExpanded,
  onToggle 
}: {
  title: string;
  options: string[];
  selectedOptions: string[];
  onChange: (values: string[]) => void;
  type?: 'checkbox' | 'radio';
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    // Use a small delay to avoid immediate closure when opening
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, onToggle]);

  const handleCheckboxChange = (value: string) => {
    if (selectedOptions.includes(value)) {
      onChange(selectedOptions.filter(v => v !== value));
    } else {
      onChange([...selectedOptions, value]);
    }
  };

  const handleRadioChange = (value: string) => {
    onChange([value]);
  };

  const formatLabel = (value: string): string => {
    if (value === 'all') return 'Todas';
    if (value === 'true') return 'Sí';
    if (value === 'false') return 'No';
    if (value === 'N/A') return 'Sin asignar';
    return value;
  };

  return (
    <div className={styles.filterSection} ref={sectionRef}>
      <button
        className={styles.filterSectionHeader}
        onClick={onToggle}
        type="button"
        aria-expanded={isExpanded}
        aria-haspopup="true"
      >
        <span className={styles.filterSectionTitle}>{title}</span>
        <div className={styles.filterSectionHeaderRight}>
          {selectedOptions.length > 0 && !selectedOptions.includes('all') && (
            <span className={styles.filterCount}>{selectedOptions.length}</span>
          )}
          {isExpanded ? (
            <ChevronUp className={styles.chevronIcon} />
          ) : (
            <ChevronDown className={styles.chevronIcon} />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className={styles.filterOptions}>
          {options.map((option) => (
            <label key={option} className={styles.filterOption}>
              <input
                type={type}
                name={type === 'radio' ? title : undefined}
                checked={selectedOptions.includes(option)}
                onChange={() =>
                  type === 'checkbox'
                    ? handleCheckboxChange(option)
                    : handleRadioChange(option)
                }
                className={styles.filterInput}
              />
              <span className={styles.filterLabel}>{formatLabel(option)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardFilters(props: DashboardFiltersProps) {
  const { availableVendedores, availableCerrada, selectedVendedor, selectedCerrada, onVendedorChange, onCerradaChange, onClearFilters } = props;
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const hasActiveFilters = 
    (selectedVendedor.length > 0) || 
    (selectedCerrada.length > 0 && !selectedCerrada.includes('all'));

  const activeFilterCount = 
    selectedVendedor.length + 
    (selectedCerrada.includes('all') ? 0 : selectedCerrada.length);

  const handleToggleSection = (sectionTitle: string) => {
    setExpandedSection(expandedSection === sectionTitle ? null : sectionTitle);
  };

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filtersHeader}>
        <div className={styles.filtersTitleWrapper}>
          <Filter className={styles.filterIcon} />
          <h2 className={styles.filtersTitle}>Filtros</h2>
          {activeFilterCount > 0 && (
            <span className={styles.activeFilterBadge}>{activeFilterCount}</span>
          )}
        </div>

        {hasActiveFilters && (
          <button className={styles.clearFiltersButton} onClick={onClearFilters}>
            <X className={styles.clearIcon} />
            Limpiar filtros
          </button>
        )}
      </div>

      <div className={styles.filtersContent}>
        <div className={styles.filtersGrid}>
          <FilterSection
            title="Vendedor"
            options={availableVendedores}
            selectedOptions={selectedVendedor}
            onChange={onVendedorChange}
            isExpanded={expandedSection === 'Vendedor'}
            onToggle={() => handleToggleSection('Vendedor')}
          />

          <FilterSection
            title="Cerrada"
            options={availableCerrada as string[]}
            selectedOptions={selectedCerrada as string[]}
            onChange={(values) => onCerradaChange(values as ('true' | 'false' | 'all')[])}
            type="radio"
            isExpanded={expandedSection === 'Cerrada'}
            onToggle={() => handleToggleSection('Cerrada')}
          />
        </div>
      </div>
    </div>
  );
}

