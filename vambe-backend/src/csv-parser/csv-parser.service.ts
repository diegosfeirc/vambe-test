import { Injectable, Logger } from '@nestjs/common';
import { Readable } from 'stream';
import csvParser from 'csv-parser';
import { CsvRowValidator } from './validators/csv-row.validator';
import {
  CsvParseResult,
  ClientMeeting,
  ValidationError,
  CsvRow,
} from './interfaces/client-meeting.interface';

@Injectable()
export class CsvParserService {
  private readonly logger = new Logger(CsvParserService.name);

  constructor(private readonly csvRowValidator: CsvRowValidator) {}

  async parseCsvBuffer(buffer: Buffer): Promise<CsvParseResult> {
    return new Promise((resolve, reject) => {
      const validData: ClientMeeting[] = [];
      const errors: ValidationError[] = [];
      let totalRows = 0;

      const stream = Readable.from(buffer);

      stream
        .pipe(csvParser())
        .on('data', (row: CsvRow) => {
          totalRows++;
          const validationResult =
            this.csvRowValidator.validateClientMeetingCsvRow(row, totalRows);

          if (validationResult.isValid && validationResult.data) {
            validData.push(validationResult.data);
          } else {
            errors.push(...validationResult.errors);
          }
        })
        .on('end', () => {
          this.logger.log(
            `CSV processing completed. Total rows: ${totalRows}, Valid rows: ${validData.length}, Errors: ${errors.length}`,
          );

          const result: CsvParseResult = {
            totalRows,
            validRows: validData.length,
            data: validData,
            errors,
          };

          resolve(result);
        })
        .on('error', (error: Error) => {
          this.logger.error(`Error parsing CSV: ${error.message}`);
          reject(error);
        });
    });
  }

  async validateAndParseCsv(buffer: Buffer): Promise<CsvParseResult> {
    try {
      const result = await this.parseCsvBuffer(buffer);

      if (result.errors.length > 0) {
        this.logger.warn(
          `CSV processed with ${result.errors.length} validation errors`,
        );
      }

      return result;
    } catch (error) {
      this.logger.error('Error validating and parsing CSV', error);
      throw error;
    }
  }
}
