import { ClientClassification } from '@/components/Leads/ClassificationTable/interfaces';
import { CloseRateChartData } from '@/components/Dashboard/CloseRateChart/interfaces';

type CategoryKey = 'industry' | 'leadSource' | 'interactionVolume' | 'mainPainPoint' | 'techMaturity' | 'urgency';

/**
 * Calculates close rate data for a given category
 * @param classifications - Array of client classifications
 * @param categoryKey - The category field to group by
 * @returns Array of close rate data sorted by close rate percentage (descending)
 */
export const calculateCloseRateByCategory = (
  classifications: ClientClassification[],
  categoryKey: CategoryKey,
): CloseRateChartData[] => {
  const categoryData = new Map<string, { total: number; closed: number }>();

  classifications.forEach((classification) => {
    const categoryValue = classification[categoryKey];
    
    if (categoryValue) {
      const current = categoryData.get(categoryValue) || { total: 0, closed: 0 };
      current.total += 1;
      
      if (classification.isClosed === true) {
        current.closed += 1;
      }
      
      categoryData.set(categoryValue, current);
    }
  });

  return Array.from(categoryData.entries())
    .map(([category, { total, closed }]) => {
      const closeRate = total > 0 ? (closed / total) * 100 : 0;
      const open = total - closed;
      
      return {
        category,
        total,
        closed,
        open,
        closeRate: Number(closeRate.toFixed(1)),
      };
    })
    .sort((a, b) => b.closeRate - a.closeRate);
};

export const DEFAULT_CLOSE_RATE_COLOR = '#059669'; // emerald-600

