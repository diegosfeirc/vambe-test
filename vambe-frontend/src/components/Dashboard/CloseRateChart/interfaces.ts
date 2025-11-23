export interface CloseRateChartData {
  category: string;
  total: number;
  closed: number;
  open: number;
  closeRate: number; // Percentage (0-100)
}

export interface CloseRateChartProps {
  title: string;
  data: CloseRateChartData[];
  color?: string;
  height?: number;
}

export interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: CloseRateChartData;
    dataKey: string;
  }>;
}

