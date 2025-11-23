import { ClientClassification } from '@/components/Leads/ClassificationTable/interfaces';
import { MonthlyLeadsData } from '@/components/Dashboard/SalesTendencyChart/interfaces';

/**
 * Calculates the number of leads per month from classifications
 * and projects the trend for the next 6 months using linear regression
 */
export const calculateLeadsPerMonth = (
  classifications: ClientClassification[],
): MonthlyLeadsData[] => {
  // Filter classifications with valid meeting dates
  const validClassifications = classifications.filter(
    (c) => c.meetingDate && c.meetingDate.trim() !== ''
  );

  if (validClassifications.length === 0) {
    return [];
  }

  // Group leads by month
  const monthlyCounts = new Map<string, number>();

  validClassifications.forEach((classification) => {
    const date = new Date(classification.meetingDate!);
    
    // Skip invalid dates
    if (isNaN(date.getTime())) {
      return;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

    monthlyCounts.set(monthKey, (monthlyCounts.get(monthKey) || 0) + 1);
  });

  // Convert to array and sort by month
  const historicalData: MonthlyLeadsData[] = Array.from(monthlyCounts.entries())
    .map(([monthKey, leads]) => {
      const [year, month] = monthKey.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      const monthLabel = date.toLocaleDateString('es-ES', {
        month: 'short',
        year: 'numeric',
      });

      return {
        month: monthKey,
        monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
        leads,
        isProjected: false,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  if (historicalData.length === 0) {
    return [];
  }

  // Calculate linear regression for trend projection
  const { slope, intercept } = calculateLinearRegression(historicalData);

  // Get the last month from historical data
  const lastMonth = historicalData[historicalData.length - 1];
  const [lastYear, lastMonthNum] = lastMonth.month.split('-').map(Number);

  // Project next 6 months
  const projectedData: MonthlyLeadsData[] = [];
  for (let i = 1; i <= 6; i++) {
    const projectedMonth = lastMonthNum + i;
    let year = lastYear;
    let month = projectedMonth;

    // Handle year overflow
    if (projectedMonth > 12) {
      year += Math.floor((projectedMonth - 1) / 12);
      month = ((projectedMonth - 1) % 12) + 1;
    }

    const monthKey = `${year}-${month.toString().padStart(2, '0')}`;
    const date = new Date(year, month - 1, 1);
    const monthLabel = date.toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric',
    });

    // Calculate projected value using linear regression
    // Use the index from the start of historical data
    const xValue = historicalData.length + i - 1;
    const projectedLeads = Math.max(0, Math.round(slope * xValue + intercept));

    projectedData.push({
      month: monthKey,
      monthLabel: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
      leads: projectedLeads,
      isProjected: true,
    });
  }

  return [...historicalData, ...projectedData];
};

/**
 * Calculates linear regression (y = mx + b) for trend projection
 * Returns slope (m) and intercept (b)
 */
const calculateLinearRegression = (
  data: MonthlyLeadsData[],
): { slope: number; intercept: number } => {
  const n = data.length;
  
  if (n < 2) {
    // If we have less than 2 data points, use the average
    const avg = data.length > 0 ? data[0].leads : 0;
    return { slope: 0, intercept: avg };
  }

  // x = index (0, 1, 2, ...), y = leads
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  data.forEach((point, index) => {
    const x = index;
    const y = point.leads;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

