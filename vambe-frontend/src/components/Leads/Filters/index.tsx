'use client';

import { useState, useEffect, useRef } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './styles.module.css';
import { FiltersProps, FilterSectionProps } from './interfaces';

function FilterSection({ 
  title, 
  options, 
  selectedOptions, 
  onChange, 
  type = 'checkbox',
  isExpanded,
  onToggle 
}: FilterSectionProps) {
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

export default function Filters(props: FiltersProps) {
  const { availableFilters, activeFilters, onFilterChange, onClearFilters } = props;
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const hasActiveFilters = 
    (activeFilters.vendedor.length > 0) || 
    (activeFilters.cerrada.length > 0 && !activeFilters.cerrada.includes('all')) ||
    (activeFilters.industria.length > 0) ||
    (activeFilters.fuente.length > 0) ||
    (activeFilters.volumen.length > 0) ||
    (activeFilters.dolorPrincipal.length > 0) ||
    (activeFilters.madurezTech.length > 0) ||
    (activeFilters.urgencia.length > 0);

  const activeFilterCount = 
    activeFilters.vendedor.length + 
    (activeFilters.cerrada.includes('all') ? 0 : activeFilters.cerrada.length) +
    activeFilters.industria.length +
    activeFilters.fuente.length +
    activeFilters.volumen.length +
    activeFilters.dolorPrincipal.length +
    activeFilters.madurezTech.length +
    activeFilters.urgencia.length;

  const handleToggleSection = (sectionTitle: string) => {
    setExpandedSection(expandedSection === sectionTitle ? null : sectionTitle);
  };

  const filterSections = [
    {
      key: 'vendedor',
      title: 'Vendedor',
      options: availableFilters.vendedor,
      selectedOptions: activeFilters.vendedor,
      onChange: (values: string[]) => onFilterChange('vendedor', values),
      type: 'checkbox' as const,
    },
    {
      key: 'cerrada',
      title: 'Cerrada',
      options: availableFilters.cerrada as string[],
      selectedOptions: activeFilters.cerrada as string[],
      onChange: (values: string[]) => onFilterChange('cerrada', values as ('true' | 'false' | 'all')[]),
      type: 'radio' as const,
    },
    {
      key: 'industria',
      title: 'Industria',
      options: availableFilters.industria,
      selectedOptions: activeFilters.industria,
      onChange: (values: string[]) => onFilterChange('industria', values),
      type: 'checkbox' as const,
    },
    {
      key: 'fuente',
      title: 'Fuente',
      options: availableFilters.fuente,
      selectedOptions: activeFilters.fuente,
      onChange: (values: string[]) => onFilterChange('fuente', values),
      type: 'checkbox' as const,
    },
    {
      key: 'volumen',
      title: 'Volumen',
      options: availableFilters.volumen,
      selectedOptions: activeFilters.volumen,
      onChange: (values: string[]) => onFilterChange('volumen', values),
      type: 'checkbox' as const,
    },
    {
      key: 'dolorPrincipal',
      title: 'Dolor Principal',
      options: availableFilters.dolorPrincipal,
      selectedOptions: activeFilters.dolorPrincipal,
      onChange: (values: string[]) => onFilterChange('dolorPrincipal', values),
      type: 'checkbox' as const,
    },
    {
      key: 'madurezTech',
      title: 'Madurez Tech',
      options: availableFilters.madurezTech,
      selectedOptions: activeFilters.madurezTech,
      onChange: (values: string[]) => onFilterChange('madurezTech', values),
      type: 'checkbox' as const,
    },
    {
      key: 'urgencia',
      title: 'Urgencia',
      options: availableFilters.urgencia,
      selectedOptions: activeFilters.urgencia,
      onChange: (values: string[]) => onFilterChange('urgencia', values),
      type: 'checkbox' as const,
    },
  ];

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
          {filterSections.map((section) => (
            <FilterSection
              key={section.key}
              title={section.title}
              options={section.options}
              selectedOptions={section.selectedOptions}
              onChange={section.onChange}
              type={section.type}
              isExpanded={expandedSection === section.title}
              onToggle={() => handleToggleSection(section.title)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

