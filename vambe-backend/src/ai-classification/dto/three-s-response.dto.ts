import { ApiProperty } from '@nestjs/swagger';
import { Recommendation } from '../interfaces/three-s.interface';

export class ThreeSResponseDto {
  @ApiProperty({
    description:
      'Lista de recomendaciones "Start" - acciones que se deben comenzar a realizar',
    type: [Recommendation],
    example: [
      {
        title: 'Implementar chatbot para atención 24/7',
        description:
          'Implementar un chatbot con IA que pueda atender consultas básicas de clientes las 24 horas del día, reduciendo la carga de trabajo del equipo de atención al cliente y mejorando los tiempos de respuesta.',
      },
    ],
  })
  start: Array<{ title: string; description: string }>;

  @ApiProperty({
    description:
      'Lista de recomendaciones "Stop" - acciones que se deben dejar de realizar',
    type: [Recommendation],
    example: [
      {
        title: 'Eliminar procesos manuales redundantes',
        description:
          'Identificar y eliminar procesos manuales que pueden ser automatizados, como la programación de citas o el seguimiento de leads, para mejorar la eficiencia operativa.',
      },
    ],
  })
  stop: Array<{ title: string; description: string }>;

  @ApiProperty({
    description:
      'Lista de recomendaciones "Spice Up" - acciones que se deben mejorar o potenciar',
    type: [Recommendation],
    example: [
      {
        title: 'Mejorar personalización de comunicaciones',
        description:
          'Utilizar datos de comportamiento del cliente para personalizar las comunicaciones y ofertas, aumentando la relevancia y la tasa de conversión.',
      },
    ],
  })
  spiceUp: Array<{ title: string; description: string }>;

  @ApiProperty({
    description:
      'Tiempo de procesamiento de la generación de recomendaciones 3S en milisegundos',
    example: 3200,
    type: Number,
  })
  processingTime: number;

  constructor(recommendations: {
    start: Array<{ title: string; description: string }>;
    stop: Array<{ title: string; description: string }>;
    spiceUp: Array<{ title: string; description: string }>;
    processingTime: number;
  }) {
    this.start = recommendations.start;
    this.stop = recommendations.stop;
    this.spiceUp = recommendations.spiceUp;
    this.processingTime = recommendations.processingTime;
  }
}
