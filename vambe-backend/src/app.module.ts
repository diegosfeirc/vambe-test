import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CsvParserModule } from './csv-parser/csv-parser.module';
import { AiClassificationModule } from './ai-classification/ai-classification.module';
import { resolve } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles globalmente
      envFilePath: resolve(__dirname, '../../.env'), // Apunta al .env en la raíz del proyecto
    }),
    CsvParserModule,
    AiClassificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
