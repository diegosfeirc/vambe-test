import { ApiProperty } from '@nestjs/swagger';

export class Recommendation {
  @ApiProperty({
    description: 'Título de la recomendación (5-7 palabras)',
    example: 'Implementar chatbot para atención 24/7',
    type: String,
  })
  title: string;

  @ApiProperty({
    description: 'Descripción completa de la recomendación',
    example:
      'Implementar un chatbot con IA que pueda atender consultas básicas de clientes las 24 horas del día, reduciendo la carga de trabajo del equipo de atención al cliente y mejorando los tiempos de respuesta.',
    type: String,
  })
  description: string;
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
