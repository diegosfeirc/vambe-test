import { Module } from '@nestjs/common';
import { CsvParserController } from './csv-parser.controller';
import { CsvParserService } from './csv-parser.service';
import { CsvRowValidator } from './validators/csv-row.validator';

@Module({
  controllers: [CsvParserController],
  providers: [CsvParserService, CsvRowValidator],
  exports: [CsvParserService],
})
export class CsvParserModule {}
