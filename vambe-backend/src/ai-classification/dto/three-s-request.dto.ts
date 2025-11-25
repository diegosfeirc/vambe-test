import { ApiProperty } from '@nestjs/swagger';
import { ClientClassification } from '../interfaces/classification.interface';

export class ThreeSRequestDto {
  @ApiProperty({
    description:
      'Lista de clasificaciones de clientes para generar recomendaciones 3S (Start, Stop, Spice Up)',
    type: [ClientClassification],
  })
  classifications: ClientClassification[];

  constructor(classifications: ClientClassification[]) {
    this.classifications = classifications;
  }
}
