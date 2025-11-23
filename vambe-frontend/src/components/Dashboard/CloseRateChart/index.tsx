'use client';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import styles from './styles.module.css';
import { CloseRateChartProps, CustomTooltipProps } from './interfaces';

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const { category, total, closed, open, closeRate } = data;

    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{category}</p>
        <p className={styles.tooltipValue}>
          Tasa de Cierre: <strong>{closeRate}%</strong>
        </p>
        <p className={styles.tooltipValue}>
          Total: <strong>{total}</strong> {total === 1 ? 'lead' : 'leads'}
        </p>
        <p className={styles.tooltipValue}>
          Cerrados: <strong>{closed}</strong> {closed === 1 ? 'lead' : 'leads'}
        </p>
        {open > 0 && (
          <p className={styles.tooltipValue}>
            Abiertos: <strong>{open}</strong> {open === 1 ? 'lead' : 'leads'}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function CloseRateChart({
  title,
  data,
  height = 400,
}: CloseRateChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.emptyState}>
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  // Calculate overall average close rate
  const totalLeads = data.reduce((sum, item) => sum + item.total, 0);
  const totalClosed = data.reduce((sum, item) => sum + item.closed, 0);
  const averageCloseRate = totalLeads > 0 ? (totalClosed / totalLeads) * 100 : 0;

  // Calculate max value for Y-axis domain (0-100 for percentages)
  const maxCloseRate = Math.max(...data.map((item) => item.closeRate), 0);
  const yAxisMax = Math.min(Math.ceil(maxCloseRate / 10) * 10 + 10, 100);
  const yAxisDomain: [number, number] = [0, yAxisMax];

  // Generate color based on comparison with average close rate
  const getBarColor = (closeRate: number): string => {
    const threshold = averageCloseRate * 0.2; // 20% of average as threshold
    
    if (closeRate >= averageCloseRate) {
      return '#059669'; // emerald-600 - At or above average
    } else if (closeRate >= averageCloseRate - threshold) {
      return '#f59e0b'; // amber-500 - Between average and average - 20%
    } else {
      return '#ef4444'; // red-500 - Below average - 20%
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsBarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(241, 245, 249)" />
            <XAxis
              dataKey="category"
              angle={-45}
              textAnchor="end"
              height={120}
              tick={{ fontSize: 12, fill: 'rgb(71, 85, 105)' }}
              interval={0}
            />
            <YAxis
              domain={yAxisDomain}
              tick={{ fontSize: 12, fill: 'rgb(71, 85, 105)' }}
              label={{
                value: 'Tasa de Cierre (%)',
                angle: -90,
                position: 'insideLeft',
                style: {
                  textAnchor: 'middle',
                  fill: 'rgb(71, 85, 105)',
                  fontSize: '0.875rem',
                },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={averageCloseRate}
              stroke="#9333ea"
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: `Promedio: ${averageCloseRate.toFixed(1)}%`,
                position: 'right',
                fill: '#9333ea',
                fontSize: 12,
                fontWeight: 600,
              }}
            />
            <Bar
              dataKey="closeRate"
              name="Tasa de Cierre"
              radius={[8, 8, 0, 0]}
              className={styles.bar}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.closeRate)} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

