export interface Recommendation {
  title: string; // 5-7 palabras
  description: string; // Descripción completa
}

export interface ThreeSRecommendations {
  start: Recommendation[]; // Exactamente 3
  stop: Recommendation[]; // Exactamente 3
  spiceUp: Recommendation[]; // Exactamente 3
  processingTime: number;
}

export interface ClassificationStats {
  closedCount: number;
  closedPercentage: number;
  industryDistribution: Record<string, number>;
  leadSourceDistribution: Record<string, number>;
  volumeDistribution: Record<string, number>;
  painPointDistribution: Record<string, number>;
  urgencyDistribution: Record<string, number>;
}
