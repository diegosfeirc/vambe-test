import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AiClassificationService } from './ai-classification.service';
import { ThreeSRequestDto } from './dto/three-s-request.dto';
import { ThreeSResponseDto } from './dto/three-s-response.dto';

@ApiTags('AI Classification')
@Controller('ai-classification')
export class AiClassificationController {
  private readonly logger = new Logger(AiClassificationController.name);

  constructor(
    private readonly aiClassificationService: AiClassificationService,
  ) {}

  @Post('three-s')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generar recomendaciones 3S (Start, Stop, Spice Up)',
    description:
      'Genera recomendaciones estratégicas basadas en las clasificaciones de clientes. Las recomendaciones se organizan en tres categorías: Start (acciones a comenzar), Stop (acciones a detener) y Spice Up (acciones a mejorar o potenciar).',
  })
  @ApiBody({
    type: ThreeSRequestDto,
    description:
      'Lista de clasificaciones de clientes para generar recomendaciones',
  })
  @ApiResponse({
    status: 200,
    description: 'Recomendaciones 3S generadas exitosamente',
    type: ThreeSResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Error en la solicitud: el array de clasificaciones está vacío o hay un error en el procesamiento',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 400,
        },
        message: {
          type: 'string',
          example: 'Classifications array cannot be empty',
        },
        error: {
          type: 'string',
          example: 'Bad Request',
        },
      },
    },
  })
  async generateThreeS(
    @Body() request: ThreeSRequestDto,
  ): Promise<ThreeSResponseDto> {
    this.logger.log(
      `Received 3S request for ${request.classifications.length} classifications`,
    );

    if (!request.classifications || request.classifications.length === 0) {
      this.logger.warn('Empty classifications array received');
      throw new BadRequestException('Classifications array cannot be empty');
    }

    const result =
      await this.aiClassificationService.generateThreeSRecommendations(
        request.classifications,
      );

    return new ThreeSResponseDto(result);
  }
}
