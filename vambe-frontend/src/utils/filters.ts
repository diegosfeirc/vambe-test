import { ClientClassification } from "@/components/Leads/ClassificationTable/interfaces"

/**
 * Filter options interface
 */
export interface FilterOptions {
  vendedor: string[];
  cerrada: ('true' | 'false' | 'all')[];
  industria: string[];
  fuente: string[];
  volumen: string[];
  dolorPrincipal: string[];
  madurezTech: string[];
  urgencia: string[];
}

/**
 * Extracts unique values from classifications for each filterable field
 */
export function extractFilterOptions(classifications: ClientClassification[]): FilterOptions {
  const vendedores = new Set<string>();
  const industrias = new Set<string>();
  const fuentes = new Set<string>();
  const volumenes = new Set<string>();
  const doloresPrincipales = new Set<string>();
  const madureces = new Set<string>();
  const urgencias = new Set<string>();

  classifications.forEach((client) => {
    if (client.assignedSalesperson) vendedores.add(client.assignedSalesperson);
    if (client.industry) industrias.add(client.industry);
    if (client.leadSource) fuentes.add(client.leadSource);
    if (client.interactionVolume) volumenes.add(client.interactionVolume);
    if (client.mainPainPoint) doloresPrincipales.add(client.mainPainPoint);
    if (client.techMaturity) madureces.add(client.techMaturity);
    if (client.urgency) urgencias.add(client.urgency);
  });

  return {
    vendedor: Array.from(vendedores).sort(),
    cerrada: ['all', 'true', 'false'],
    industria: Array.from(industrias).sort(),
    fuente: Array.from(fuentes).sort(),
    volumen: Array.from(volumenes).sort(),
    dolorPrincipal: Array.from(doloresPrincipales).sort(),
    madurezTech: Array.from(madureces).sort(),
    urgencia: Array.from(urgencias).sort(),
  };
}

/**
 * Applies filters to classifications array
 */
export function applyFilters(
  classifications: ClientClassification[],
  filters: FilterOptions
): ClientClassification[] {
  return classifications.filter((client) => {
    // Filter by vendedor
    if (filters.vendedor.length > 0) {
      const vendedor = client.assignedSalesperson || 'N/A';
      if (!filters.vendedor.includes(vendedor)) return false;
    }

    // Filter by cerrada
    if (filters.cerrada.length > 0 && !filters.cerrada.includes('all')) {
      const isClosed = client.isClosed === true;
      const closedFilter = filters.cerrada.includes('true');
      if (isClosed !== closedFilter) return false;
    }

    // Filter by industria
    if (filters.industria.length > 0) {
      if (!filters.industria.includes(client.industry)) return false;
    }

    // Filter by fuente
    if (filters.fuente.length > 0) {
      if (!filters.fuente.includes(client.leadSource)) return false;
    }

    // Filter by volumen
    if (filters.volumen.length > 0) {
      if (!filters.volumen.includes(client.interactionVolume)) return false;
    }

    // Filter by dolor principal
    if (filters.dolorPrincipal.length > 0) {
      if (!filters.dolorPrincipal.includes(client.mainPainPoint)) return false;
    }

    // Filter by madurez tech
    if (filters.madurezTech.length > 0) {
      if (!filters.madurezTech.includes(client.techMaturity)) return false;
    }

    // Filter by urgencia
    if (filters.urgencia.length > 0) {
      if (!filters.urgencia.includes(client.urgency)) return false;
    }

    return true;
  });
}

/**
 * Filters classifications by client name (case-insensitive search)
 * @param classifications - Array of client classifications to search
 * @param searchQuery - Search query string
 * @returns Filtered array of classifications matching the search query
 */
export function searchClientsByName(
  classifications: ClientClassification[],
  searchQuery: string
): ClientClassification[] {
  if (!searchQuery.trim()) {
    return classifications;
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  
  return classifications.filter((client) => {
    const clientName = client.clientName?.toLowerCase() || '';
    return clientName.includes(normalizedQuery);
  });
}

