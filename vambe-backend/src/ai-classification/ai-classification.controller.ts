import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AiClassificationService } from './ai-classification.service';
import { ClassificationRequestDto } from './dto/classification-request.dto';
import { ClassificationResponseDto } from './dto/classification-response.dto';

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
}
