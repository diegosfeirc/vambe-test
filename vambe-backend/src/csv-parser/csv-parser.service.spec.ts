import { Test, TestingModule } from '@nestjs/testing';
import { CsvParserService } from './csv-parser.service';
import { CsvRowValidator } from './validators/csv-row.validator';

describe('CsvParserService', () => {
  let service: CsvParserService;
  let validator: CsvRowValidator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvParserService, CsvRowValidator],
    }).compile();

    service = module.get<CsvParserService>(CsvParserService);
    validator = module.get<CsvRowValidator>(CsvRowValidator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(validator).toBeDefined();
  });

  describe('parseCsvBuffer', () => {
    it('should parse valid CSV data successfully', async () => {
      const csvContent = `Nombre,Correo Electrónico,Número de Teléfono,Vendedor Asignado,Fecha de la Reunión,closed,Transcripción
Juan Pérez,juan.perez@empresa.com,+56912345678,María González,2024-01-15,1,"Cliente interesado en solución"
Ana Martínez,ana.martinez@tech.com,+56987654321,Carlos Rodríguez,2024-01-16,0,"Reunión inicial"`;

      const buffer = Buffer.from(csvContent, 'utf-8');
      const result = await service.parseCsvBuffer(buffer);

      expect(result.totalRows).toBe(2);
      expect(result.validRows).toBe(2);
      expect(result.data).toHaveLength(2);
      expect(result.errors).toHaveLength(0);

      expect(result.data[0]).toEqual({
        nombre: 'Juan Pérez',
        correo: 'juan.perez@empresa.com',
        telefono: '+56912345678',
        vendedorAsignado: 'María González',
        fechaReunion: '2024-01-15',
        cerrado: true,
        transcripcion: 'Cliente interesado en solución',
      });

      expect(result.data[1]).toEqual({
        nombre: 'Ana Martínez',
        correo: 'ana.martinez@tech.com',
        telefono: '+56987654321',
        vendedorAsignado: 'Carlos Rodríguez',
        fechaReunion: '2024-01-16',
        cerrado: false,
        transcripcion: 'Reunión inicial',
      });
    });

    it('should handle CSV with invalid email', async () => {
      const csvContent = `Nombre,Correo Electrónico,Número de Teléfono,Vendedor Asignado,Fecha de la Reunión,closed
Juan Pérez,email-invalido,+56912345678,María González,2024-01-15,1`;

      const buffer = Buffer.from(csvContent, 'utf-8');
      const result = await service.parseCsvBuffer(buffer);

      expect(result.totalRows).toBe(1);
      expect(result.validRows).toBe(0);
      expect(result.data).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('correo');
      expect(result.errors[0].message).toContain('formato válido');
    });

    it('should handle CSV with missing required fields', async () => {
      const csvContent = `Nombre,Correo Electrónico,Número de Teléfono,Vendedor Asignado,Fecha de la Reunión,closed
,juan.perez@empresa.com,+56912345678,María González,2024-01-15,1`;

      const buffer = Buffer.from(csvContent, 'utf-8');
      const result = await service.parseCsvBuffer(buffer);

      expect(result.totalRows).toBe(1);
      expect(result.validRows).toBe(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe('nombre');
    });

    it('should parse boolean values correctly', async () => {
      const csvContent = `Nombre,Correo Electrónico,Número de Teléfono,Vendedor Asignado,Fecha de la Reunión,closed
Test1,test1@test.com,123456,Vendor1,2024-01-01,1
Test2,test2@test.com,123456,Vendor2,2024-01-02,0
Test3,test3@test.com,123456,Vendor3,2024-01-03,true
Test4,test4@test.com,123456,Vendor4,2024-01-04,false`;

      const buffer = Buffer.from(csvContent, 'utf-8');
      const result = await service.parseCsvBuffer(buffer);

      expect(result.validRows).toBe(4);
      expect(result.data[0].cerrado).toBe(true);
      expect(result.data[1].cerrado).toBe(false);
      expect(result.data[2].cerrado).toBe(true);
      expect(result.data[3].cerrado).toBe(false);
    });
  });

  describe('validateAndParseCsv', () => {
    it('should validate and parse CSV successfully', async () => {
      const csvContent = `Nombre,Correo,Teléfono,Vendedor,Fecha,closed
Juan,juan@test.com,123,Vendor,2024-01-01,1`;

      const buffer = Buffer.from(csvContent, 'utf-8');
      const result = await service.validateAndParseCsv(buffer);

      expect(result.totalRows).toBe(1);
      expect(result.validRows).toBe(1);
    });
  });
});
