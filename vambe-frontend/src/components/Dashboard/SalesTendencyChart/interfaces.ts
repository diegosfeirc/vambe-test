export interface SalesTendencyChartProps {
  title?: string;
  data: MonthlyLeadsData[];
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: MonthlyLeadsData;
    dataKey: string;
  }>;
}

export interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: MonthlyLeadsData;
}

export interface MonthlyLeadsData {
    month: string; // Format: "YYYY-MM"
    monthLabel: string; // Format: "MMM YYYY" (e.g., "Ene 2024")
    leads: number;
    isProjected: boolean;
}
