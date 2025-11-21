import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CsvParserModule } from './csv-parser/csv-parser.module';

@Module({
  imports: [CsvParserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
