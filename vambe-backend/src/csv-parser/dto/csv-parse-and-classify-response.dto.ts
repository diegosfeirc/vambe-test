import { ApiProperty } from '@nestjs/swagger';
import {
  ValidationError,
  ClientMeeting,
} from '../interfaces/client-meeting.interface';
import { ClientClassification } from '../../ai-classification/interfaces/classification.interface';

export class ParseResult {
  @ApiProperty({
    description: 'Número total de filas procesadas en el archivo CSV',
    example: 100,
    type: Number,
  })
  totalRows: number;

  @ApiProperty({
    description: 'Número de filas válidas después de la validación',
    example: 95,
    type: Number,
  })
  validRows: number;

  @ApiProperty({
    description: 'Lista de errores de validación encontrados en el archivo',
    type: [ValidationError],
    example: [
      {
        row: 3,
        field: 'correo',
        value: 'correo-invalido',
        message: 'El correo electrónico no tiene un formato válido',
      },
    ],
  })
  errors: ValidationError[];

  constructor(totalRows: number, validRows: number, errors: ValidationError[]) {
    this.totalRows = totalRows;
    this.validRows = validRows;
    this.errors = errors;
  }
}

export class ClassificationResult {
  @ApiProperty({
    description: 'Número total de clientes clasificados',
    example: 95,
    type: Number,
  })
  totalClients: number;

  @ApiProperty({
    description: 'Lista de clasificaciones de clientes generadas por IA',
    type: [ClientClassification],
  })
  classifications: ClientClassification[];

  @ApiProperty({
    description: 'Tiempo de procesamiento de la clasificación en milisegundos',
    example: 2500,
    type: Number,
  })
  processingTime: number;

  constructor(
    totalClients: number,
    classifications: ClientClassification[],
    processingTime: number,
  ) {
    this.totalClients = totalClients;
    this.classifications = classifications;
    this.processingTime = processingTime;
  }
}

export class CsvParseAndClassifyResponseDto {
  @ApiProperty({
    description: 'Resultado del parsing y validación del archivo CSV',
    type: ParseResult,
  })
  parsing: ParseResult;

  @ApiProperty({
    description:
      'Resultado de la clasificación de clientes mediante IA. Es null si no hay filas válidas para clasificar',
    type: ClassificationResult,
    nullable: true,
    required: false,
  })
  classification: ClassificationResult | null;

  @ApiProperty({
    description: 'Datos de los clientes validados y parseados del CSV',
    type: [ClientMeeting],
  })
  data: ClientMeeting[];

  constructor(
    parsing: ParseResult,
    classification: ClassificationResult | null,
    data: ClientMeeting[],
  ) {
    this.parsing = parsing;
    this.classification = classification;
    this.data = data;
  }
}
