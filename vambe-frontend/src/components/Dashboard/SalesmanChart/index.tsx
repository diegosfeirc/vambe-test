'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import styles from './styles.module.css';
import { SalesChartProps, CustomTooltipProps } from './interfaces';
import { DEFAULT_BAR_COLORS } from '@/utils/salesman-chart';

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    // Find the values from payload for better accuracy
    const totalBar = payload.find(p => p.dataKey === 'ventas');
    const cerradasBar = payload.find(p => p.dataKey === 'ventasCerradas');
    
    const totalVentas = totalBar?.value ?? data.ventas;
    const ventasCerradas = cerradasBar?.value ?? data.ventasCerradas;
    const ventasAbiertas = totalVentas - ventasCerradas;
    
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{data.vendedor}</p>
        <p className={styles.tooltipValue}>
          Total: <strong>{totalVentas}</strong> {totalVentas === 1 ? 'venta' : 'ventas'}
        </p>
        <p className={styles.tooltipValue}>
          Cerradas: <strong>{ventasCerradas}</strong> {ventasCerradas === 1 ? 'venta' : 'ventas'}
        </p>
        {ventasAbiertas > 0 && (
          <p className={styles.tooltipValue}>
            Abiertas: <strong>{ventasAbiertas}</strong> {ventasAbiertas === 1 ? 'venta' : 'ventas'}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function SalesManChart({ 
  title = 'Leads por Vendedor', 
  data, 
  colors = DEFAULT_BAR_COLORS 
}: SalesChartProps) {
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

  const totalVentas = data.reduce((sum, item) => sum + item.ventas, 0);
  const totalCerradas = data.reduce((sum, item) => sum + item.ventasCerradas, 0);
  
  // Calculate max value for Y-axis domain to show ticks of 1
  const maxValue = Math.max(...data.map(item => item.ventas), 0);
  // Round up to next integer and add 1 for better visualization
  const yAxisMax = Math.ceil(maxValue) + 1;
  const yAxisDomain: [number, number] = [0, yAxisMax];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={400}>
          <RechartsBarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: -50,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(241, 245, 249)" />
            <XAxis
              dataKey="vendedor"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12, fill: 'rgb(71, 85, 105)' }}
              interval={0}
            />
            <YAxis
              domain={yAxisDomain}
              allowDecimals={false}
              tickCount={yAxisMax + 1}
              tick={{ fontSize: 12, fill: 'rgb(71, 85, 105)' }}
              label={{ 
                value: 'Número de Ventas', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: 'rgb(71, 85, 105)', fontSize: '0.875rem' }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ 
                fontSize: '0.8125rem',
                color: 'rgb(71, 85, 105)'
              }}
            />
            <Bar
              dataKey="ventas"
              name="Total Leads"
              fill={colors.total}
              radius={[8, 8, 0, 0]}
              className={styles.bar}
            />
            <Bar
              dataKey="ventasCerradas"
              name="Leads Cerradas"
              fill={colors.cerradas}
              radius={[8, 8, 0, 0]}
              className={styles.bar}
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.summary}>
        <span className={styles.totalLabel}>Total Ventas:</span>
        <span className={styles.totalValue}>{totalVentas} {totalVentas === 1 ? 'venta' : 'ventas'}</span>
        <span className={styles.totalLabel} style={{ marginLeft: '1.5rem' }}>Cerradas:</span>
        <span className={styles.totalValue}>{totalCerradas} {totalCerradas === 1 ? 'venta' : 'ventas'}</span>
      </div>
    </div>
  );
}

