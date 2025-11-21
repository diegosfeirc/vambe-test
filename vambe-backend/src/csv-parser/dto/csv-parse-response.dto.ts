import {
  ValidationError,
  ClientMeeting,
} from '../interfaces/client-meeting.interface';

export class CsvParseResponseDto {
  totalRows: number;
  validRows: number;
  data: ClientMeeting[];
  errors: ValidationError[];

  constructor(
    totalRows: number,
    validRows: number,
    data: ClientMeeting[],
    errors: ValidationError[],
  ) {
    this.totalRows = totalRows;
    this.validRows = validRows;
    this.data = data;
    this.errors = errors;
  }
}
