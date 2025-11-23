import { ThreeSRecommendations } from '../interfaces/three-s.interface';

export class ThreeSResponseDto {
  start: Array<{ title: string; description: string }>;
  stop: Array<{ title: string; description: string }>;
  spiceUp: Array<{ title: string; description: string }>;
  processingTime: number;

  constructor(recommendations: ThreeSRecommendations) {
    this.start = recommendations.start;
    this.stop = recommendations.stop;
    this.spiceUp = recommendations.spiceUp;
    this.processingTime = recommendations.processingTime;
  }
}
