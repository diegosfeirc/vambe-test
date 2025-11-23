export interface DashboardFiltersProps {
    availableVendedores: string[];
    availableCerrada: ('true' | 'false' | 'all')[];
    selectedVendedor: string[];
    selectedCerrada: ('true' | 'false' | 'all')[];
    onVendedorChange: (values: string[]) => void;
    onCerradaChange: (values: ('true' | 'false' | 'all')[]) => void;
    onClearFilters: () => void;
}