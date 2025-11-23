export interface Recommendation {
    title: string;
    description: string;
}
  
export interface ThreeSRecommendations {
    start: Recommendation[];
    stop: Recommendation[];
    spiceUp: Recommendation[];
    processingTime: number;
}