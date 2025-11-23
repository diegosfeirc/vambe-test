'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Dot,
} from 'recharts';
import styles from './styles.module.css';
import { SalesTendencyChartProps, CustomTooltipProps, CustomDotProps } from './interfaces';
import { COLORS } from '@/utils/salesman-chart';

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isProjected = data.isProjected;

    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{data.monthLabel}</p>
        <p className={styles.tooltipValue}>
          Leads: <strong>{data.leads}</strong> {data.leads === 1 ? 'lead' : 'leads'}
        </p>
        {isProjected && (
          <p className={styles.tooltipProjected}>Proyección</p>
        )}
      </div>
    );
  }
  return null;
};

const CustomDot = (props: CustomDotProps) => {
  const { cx, cy, payload } = props;
  
  // Don't render dots for null values
  if (cx == null || cy == null || !payload) {
    return null;
  }
  
  if (!payload.isProjected) {
    return (
      <Dot
        cx={cx}
        cy={cy}
        r={5}
        fill={COLORS.actual}
        stroke={COLORS.actual}
        strokeWidth={2}
      />
    );
  }
  
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={4}
      fill={COLORS.projected}
      stroke={COLORS.projected}
      strokeWidth={2}
      fillOpacity={0.6}
    />
  );
};

export default function SalesTendencyChart({
  title = 'Tendencia de Leads por Mes',
  data,
}: SalesTendencyChartProps) {
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

  // Separate actual and projected data
  const actualData = data.filter((d) => !d.isProjected);
  const projectedData = data.filter((d) => d.isProjected);

  // Prepare chart data: create separate keys for actual and projected
  const chartData = data.map((item) => ({
    ...item,
    actualLeads: item.isProjected ? null : item.leads,
    projectedLeads: item.isProjected ? item.leads : null,
  }));

  // Connect the last actual point to the first projected point
  if (actualData.length > 0 && projectedData.length > 0) {
    const lastActualIndex = chartData.findIndex(
      (d) => d.month === actualData[actualData.length - 1].month
    );
    const firstProjectedIndex = chartData.findIndex(
      (d) => d.month === projectedData[0].month
    );
    
    // Set the projected value at the last actual point to connect the lines
    // This creates a smooth transition from actual to projected
    if (lastActualIndex >= 0 && firstProjectedIndex >= 0) {
      chartData[lastActualIndex].projectedLeads = chartData[lastActualIndex].actualLeads;
    }
  }

  // Calculate totals
  const totalActual = actualData.reduce((sum, item) => sum + item.leads, 0);
  const totalProjected = projectedData.reduce((sum, item) => sum + item.leads, 0);

  // Calculate max value for Y-axis
  const maxValue = Math.max(...data.map((item) => item.leads), 0);
  const yAxisMax = Math.ceil(maxValue * 1.1); // Add 10% padding
  const yAxisDomain: [number, number] = [0, yAxisMax];

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={400}>
          <RechartsLineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(241, 245, 249)" />
            <XAxis
              dataKey="monthLabel"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12, fill: 'rgb(71, 85, 105)' }}
              interval={0}
            />
            <YAxis
              domain={yAxisDomain}
              allowDecimals={false}
              tick={{ fontSize: 12, fill: 'rgb(71, 85, 105)' }}
              label={{
                value: 'Número de Leads',
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
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{
                fontSize: '0.8125rem',
                color: 'rgb(71, 85, 105)',
              }}
            />
            {/* Actual data line */}
            <Line
              type="monotone"
              dataKey="actualLeads"
              name="Leads Reales"
              stroke={COLORS.actual}
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 7 }}
              connectNulls={false}
            />
            {/* Projected data line (dashed) */}
            {projectedData.length > 0 && (
              <Line
                type="monotone"
                dataKey="projectedLeads"
                name="Proyección (6 meses)"
                stroke={COLORS.projected}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={<CustomDot />}
                activeDot={{ r: 6 }}
                connectNulls={true}
              />
            )}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.summary}>
        <span className={styles.totalLabel}>Total Real:</span>
        <span className={styles.totalValue}>
          {totalActual} {totalActual === 1 ? 'lead' : 'leads'}
        </span>
        {totalProjected > 0 && (
          <>
            <span className={styles.totalLabel} style={{ marginLeft: '1.5rem' }}>
              Proyección 6 meses:
            </span>
            <span className={styles.totalValue} style={{ color: COLORS.projected }}>
              {totalProjected} {totalProjected === 1 ? 'lead' : 'leads'}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

