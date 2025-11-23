import { PieChartData } from "@/components/Dashboard/PieChart/interfaces";

type CategoryKey = 'industry' | 'leadSource' | 'interactionVolume' | 'mainPainPoint' | 'techMaturity' | 'urgency';

export const DEFAULT_COLORS = [
    '#2563eb', // Azul (blue-600) - Alto contraste
    '#dc2626', // Rojo (red-600) - Alto contraste
    '#059669', // Verde (emerald-600) - Alto contraste
    '#ca8a04', // Amarillo (yellow-600) - Alto contraste
    '#9333ea', // Morado (purple-600) - Alto contraste
    '#ea580c', // Naranja (orange-600) - Alto contraste
    '#db2777', // Rosa (pink-600) - Alto contraste
    '#92400e', // Café (amber-800) - Alto contraste
];
  
export const RADIAN = Math.PI / 180;

export const calculateCategoryCounts = (
  classifications: Array<Record<CategoryKey, string>>,
  categoryKey: CategoryKey,
): PieChartData[] => {
  const counts = new Map<string, number>();

  classifications.forEach((classification) => {
    const value = classification[categoryKey];
    if (value) {
      counts.set(value, (counts.get(value) || 0) + 1);
    }
  });

  return Array.from(counts.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};
