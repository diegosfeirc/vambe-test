import { FilterOptions } from '@/utils/filters';

export interface FiltersProps {
  availableFilters: FilterOptions;
  activeFilters: FilterOptions;
  onFilterChange: (filterType: keyof FilterOptions, value: string[]) => void;
  onClearFilters: () => void;
}

export interface FilterSectionProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onChange: (values: string[]) => void;
  type?: 'checkbox' | 'radio';
  isExpanded: boolean;
  onToggle: () => void;
}

