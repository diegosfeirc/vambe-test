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
import {
  CsvParseAndClassifyResponseDto,
  ParseResult,
  ClassificationResult,
} from './dto/csv-parse-and-classify-response.dto';
import { AiClassificationService } from '../ai-classification/ai-classification.service';

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

  constructor(
    private readonly csvParserService: CsvParserService,
    private readonly aiClassificationService: AiClassificationService,
  ) {}

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

  @Post('upload-and-classify')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAndClassify(
    @UploadedFile() file: MulterFile,
  ): Promise<CsvParseAndClassifyResponseDto> {
    this.logger.log('Received CSV upload and classify request');

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
      // Step 1: Parse CSV
      const parseResult = await this.csvParserService.validateAndParseCsv(
        file.buffer,
      );

      this.logger.log(
        `CSV parsed: ${parseResult.validRows} valid rows out of ${parseResult.totalRows}`,
      );

      // Step 2: Classify if there are valid rows
      let classificationResult: ClassificationResult | null = null;

      if (parseResult.validRows > 0) {
        this.logger.log(
          `Starting AI classification for ${parseResult.validRows} clients`,
        );

        const aiResult = await this.aiClassificationService.classifyClients(
          parseResult.data,
        );

        classificationResult = new ClassificationResult(
          aiResult.totalClients,
          aiResult.classifications,
          aiResult.processingTime,
        );

        this.logger.log(
          `AI classification completed in ${aiResult.processingTime}ms`,
        );
      } else {
        this.logger.warn('No valid rows to classify');
      }

      // Step 3: Return combined result
      const parseResultDto = new ParseResult(
        parseResult.totalRows,
        parseResult.validRows,
        parseResult.errors,
      );

      return new CsvParseAndClassifyResponseDto(
        parseResultDto,
        classificationResult,
        parseResult.data,
      );
    } catch (error) {
      this.logger.error('Error processing CSV file and classifying', error);
      throw new BadRequestException(
        `Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
    }
  }
}
