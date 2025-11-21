import {
  ValidationError,
  ClientMeeting,
} from '../interfaces/client-meeting.interface';
import { ClientClassification } from '../../ai-classification/interfaces/classification.interface';

export class ParseResult {
  totalRows: number;
  validRows: number;
  errors: ValidationError[];

  constructor(totalRows: number, validRows: number, errors: ValidationError[]) {
    this.totalRows = totalRows;
    this.validRows = validRows;
    this.errors = errors;
  }
}

export class ClassificationResult {
  totalClients: number;
  classifications: ClientClassification[];
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
  parsing: ParseResult;
  classification: ClassificationResult | null;
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
