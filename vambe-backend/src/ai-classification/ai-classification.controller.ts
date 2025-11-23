import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { AiClassificationService } from './ai-classification.service';
import { ClassificationRequestDto } from './dto/classification-request.dto';
import { ClassificationResponseDto } from './dto/classification-response.dto';
import { ThreeSRequestDto } from './dto/three-s-request.dto';
import { ThreeSResponseDto } from './dto/three-s-response.dto';

@Controller('ai-classification')
export class AiClassificationController {
  private readonly logger = new Logger(AiClassificationController.name);

  constructor(
    private readonly aiClassificationService: AiClassificationService,
  ) {}

  @Post('classify')
  @HttpCode(HttpStatus.OK)
  async classifyClients(
    @Body() request: ClassificationRequestDto,
  ): Promise<ClassificationResponseDto> {
    this.logger.log(
      `Received classification request for ${request.clients.length} clients`,
    );

    if (!request.clients || request.clients.length === 0) {
      this.logger.warn('Empty clients array received');
      return new ClassificationResponseDto(0, [], 0);
    }

    const result = await this.aiClassificationService.classifyClients(
      request.clients,
    );

    return new ClassificationResponseDto(
      result.totalClients,
      result.classifications,
      result.processingTime,
    );
  }

  @Post('three-s')
  @HttpCode(HttpStatus.OK)
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
