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
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CsvParserService } from './csv-parser.service';
import {
  CsvParseAndClassifyResponseDto,
  ParseResult,
  ClassificationResult,
} from './dto/csv-parse-and-classify-response.dto';
import { AiClassificationService } from '../ai-classification/ai-classification.service';
import type { MulterFile } from './interfaces/multer-file.interface';

@ApiTags('CSV Parser')
@Controller('csv-parser')
export class CsvParserController {
  private readonly logger = new Logger(CsvParserController.name);

  constructor(
    private readonly csvParserService: CsvParserService,
    private readonly aiClassificationService: AiClassificationService,
  ) {}

  @Post('upload-and-classify')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir y clasificar archivo CSV',
    description:
      'Endpoint que permite subir un archivo CSV con información de clientes, lo valida, parsea y clasifica automáticamente mediante IA. El archivo debe contener columnas: nombre, correo, telefono, vendedorAsignado, fechaReunion, cerrado, y opcionalmente transcripcion.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Archivo CSV con información de clientes',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo CSV con información de clientes',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Archivo CSV procesado y clasificado exitosamente',
    type: CsvParseAndClassifyResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Error en la validación del archivo o en el procesamiento',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'El archivo debe tener extensión .csv',
        },
        error: {
          type: 'string',
          example: 'Bad Request',
        },
      },
    },
  })
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
