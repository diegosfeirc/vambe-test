'use client';

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, PieLabelRenderProps } from 'recharts';
import styles from './styles.module.css';
import { PieChartData, PieChartProps } from './interfaces';
import { DEFAULT_COLORS, RADIAN } from '@/utils/pie-charts';
import CategoryTooltip from './Tooltip';

const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;

    if (cx === undefined || cy === undefined || midAngle === undefined || 
        innerRadius === undefined || outerRadius === undefined || percent === undefined) {
        return null;
    }

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) {
        return null; // Don't show label for slices smaller than 5%
    }

    return (
        <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}
        >
        {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: PieChartData }> }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className={styles.tooltip}>
        <p className={styles.tooltipLabel}>{data.name}</p>
        <p className={styles.tooltipValue}>{data.value} leads</p>
      </div>
    );
  }
  return null;
};

export default function PieChart({ title, data, colors = DEFAULT_COLORS, emoji }: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.container}>
        <CategoryTooltip title={title} />
        <h3 className={styles.title}>
          {emoji && <span className={styles.emoji}>{emoji}</span>}
          {title}
        </h3>
        <div className={styles.emptyState}>
          <p>No hay datos disponibles</p>
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={styles.container}>
      <CategoryTooltip title={title} />
      <h3 className={styles.title}>
        {emoji && <span className={styles.emoji}>{emoji}</span>}
        {title}
      </h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={320}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={110}
              innerRadius={0}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={60}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ 
                paddingTop: '1.25rem',
                fontSize: '0.8125rem',
                color: 'rgb(71, 85, 105)'
              }}
              formatter={(value) => <span style={{ color: 'rgb(71, 85, 105)', fontWeight: 500 }}>{value}</span>}
            />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.summary}>
        <span className={styles.totalLabel}>Total:</span>
        <span className={styles.totalValue}>{total} leads</span>
      </div>
    </div>
  );
}

