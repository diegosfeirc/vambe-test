export interface PieChartData {
    name: string;
    value: number;
    [key: string]: string | number;
  }
  
export interface PieChartProps {
  title: string;
  data: PieChartData[];
  colors?: string[];
  emoji?: string;
}