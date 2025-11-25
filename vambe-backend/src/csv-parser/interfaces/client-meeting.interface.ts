import { ApiProperty } from '@nestjs/swagger';

export class ClientMeeting {
  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez',
    type: String,
  })
  nombre: string;

  @ApiProperty({
    description: 'Correo electrónico del cliente',
    example: 'juan.perez@example.com',
    type: String,
  })
  correo: string;

  @ApiProperty({
    description: 'Número de teléfono del cliente',
    example: '+56912345678',
    type: String,
  })
  telefono: string;

  @ApiProperty({
    description: 'Nombre del vendedor asignado al cliente',
    example: 'María González',
    type: String,
  })
  vendedorAsignado: string;

  @ApiProperty({
    description: 'Fecha de la reunión en formato ISO 8601',
    example: '2024-01-15T10:00:00Z',
    type: String,
  })
  fechaReunion: string;

  @ApiProperty({
    description: 'Indica si el cliente ha cerrado el trato',
    example: false,
    type: Boolean,
  })
  cerrado: boolean;

  @ApiProperty({
    description: 'Transcripción de la reunión con el cliente (opcional)',
    example:
      'El cliente está interesado en mejorar su proceso de atención al cliente...',
    type: String,
    required: false,
  })
  transcripcion?: string;
}

export interface CsvRow {
  [key: string]: string;
}

export class ValidationError {
  @ApiProperty({
    description: 'Número de fila en el CSV donde ocurrió el error',
    example: 5,
    type: Number,
  })
  row: number;

  @ApiProperty({
    description: 'Campo que causó el error de validación',
    example: 'correo',
    type: String,
  })
  field: string;

  @ApiProperty({
    description: 'Valor que causó el error',
    example: 'correo-invalido',
    type: String,
  })
  value: string;

  @ApiProperty({
    description: 'Mensaje descriptivo del error de validación',
    example: 'El correo electrónico no tiene un formato válido',
    type: String,
  })
  message: string;
}

export interface CsvParseResult {
  totalRows: number;
  validRows: number;
  data: ClientMeeting[];
  errors: ValidationError[];
}
