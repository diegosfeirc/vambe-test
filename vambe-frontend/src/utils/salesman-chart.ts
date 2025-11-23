import { SalesChartData } from '@/components/Dashboard/SalesmanChart/interfaces';
import { ClientClassification } from '@/components/Leads/ClassificationTable/interfaces';

export const COLORS = {
  actual: '#2563eb', // blue-600
  projected: '#9333ea', // purple-600
  trend: '#059669', // emerald-600
};


export const calculateSalesPerSalesperson = (
  classifications: ClientClassification[],
): SalesChartData[] => {
  const salesData = new Map<string, { total: number; cerradas: number }>();

  classifications.forEach((classification) => {
    const salesperson = classification.assignedSalesperson;
    
    // Only count if salesperson is assigned and not empty
    if (salesperson && salesperson.trim() !== '') {
      const normalizedName = salesperson.trim();
      const current = salesData.get(normalizedName) || { total: 0, cerradas: 0 };
      
      current.total += 1;
      if (classification.isClosed) {
        current.cerradas += 1;
      }
      
      salesData.set(normalizedName, current);
    }
  });

  return Array.from(salesData.entries())
    .map(([vendedor, { total, cerradas }]) => ({ 
      vendedor, 
      ventas: total,
      ventasCerradas: cerradas 
    }))
    .sort((a, b) => b.ventas - a.ventas);
};

export const DEFAULT_BAR_COLORS = {
  total: '#2563eb', // blue-600 - Total de ventas
  cerradas: '#059669', // emerald-600 - Ventas cerradas
};

