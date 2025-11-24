import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CsvParserModule } from './csv-parser/csv-parser.module';
import { AiClassificationModule } from './ai-classification/ai-classification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Hace que las variables estén disponibles globalmente
      envFilePath: '.env', // Especifica la ruta del archivo .env
    }),
    CsvParserModule,
    AiClassificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
