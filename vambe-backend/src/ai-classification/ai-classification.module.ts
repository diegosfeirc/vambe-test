import { Module } from '@nestjs/common';
import { AiClassificationController } from './ai-classification.controller';
import { AiClassificationService } from './ai-classification.service';

@Module({
  controllers: [AiClassificationController],
  providers: [AiClassificationService],
  exports: [AiClassificationService],
})
export class AiClassificationModule {}
