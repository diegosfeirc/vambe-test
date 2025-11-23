export interface SalesChartData {
  vendedor: string;
  ventas: number;
  ventasCerradas: number;
}

export interface SalesChartProps {
  title?: string;
  data: SalesChartData[];
  colors?: {
    total: string;
    cerradas: string;
  };
}

export interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        payload: SalesChartData;
        dataKey: string;
    }>;
}