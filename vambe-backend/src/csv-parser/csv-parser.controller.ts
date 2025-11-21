import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvParserService } from './csv-parser.service';
import { CsvParseResponseDto } from './dto/csv-parse-response.dto';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('csv-parser')
export class CsvParserController {
  private readonly logger = new Logger(CsvParserController.name);

  constructor(private readonly csvParserService: CsvParserService) {}

  @Post('upload')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCsv(
    @UploadedFile() file: MulterFile,
  ): Promise<CsvParseResponseDto> {
    this.logger.log('Received CSV upload request');

    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    // Validate file extension
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'csv') {
      throw new BadRequestException('El archivo debe tener extensión .csv');
    }

    // Validate MIME type
    const validMimeTypes = ['text/csv', 'application/csv', 'text/plain'];
    if (!validMimeTypes.includes(file.mimetype)) {
      this.logger.warn(
        `Invalid MIME type received: ${file.mimetype}. File: ${file.originalname}`,
      );
      throw new BadRequestException(
        'El archivo debe ser de tipo CSV (text/csv o application/csv)',
      );
    }

    // Validate file is not empty
    if (file.size === 0) {
      throw new BadRequestException('El archivo CSV está vacío');
    }

    this.logger.log(
      `Processing CSV file: ${file.originalname}, size: ${file.size} bytes`,
    );

    try {
      const result = await this.csvParserService.validateAndParseCsv(
        file.buffer,
      );

      return new CsvParseResponseDto(
        result.totalRows,
        result.validRows,
        result.data,
        result.errors,
      );
    } catch (error) {
      this.logger.error('Error processing CSV file', error);
      throw new BadRequestException(
        'Error al procesar el archivo CSV. Verifique que el formato sea correcto.',
      );
    }
  }
}
