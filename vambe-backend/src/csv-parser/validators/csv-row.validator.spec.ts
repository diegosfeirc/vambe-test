import { CsvRowValidator } from './csv-row.validator';
import { CsvRow } from '../interfaces/client-meeting.interface';

describe('CsvRowValidator', () => {
  let validator: CsvRowValidator;

  beforeEach(() => {
    validator = new CsvRowValidator();
  });

  describe('validateClientMeetingCsvRow', () => {
    it('should validate a correct row successfully', () => {
      const row: CsvRow = {
        Nombre: 'Juan Pérez',
        'Correo Electrónico': 'juan@example.com',
        'Número de Teléfono': '+56912345678',
        'Vendedor Asignado': 'María González',
        'Fecha de la Reunión': '2024-01-15',
        closed: '1',
        Transcripción: 'Test transcription',
      };

      const result = validator.validateClientMeetingCsvRow(row, 1);

      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.nombre).toBe('Juan Pérez');
      expect(result.data?.correo).toBe('juan@example.com');
      expect(result.data?.cerrado).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid email format', () => {
      const row: CsvRow = {
        Nombre: 'Juan Pérez',
        'Correo Electrónico': 'invalid-email',
        'Número de Teléfono': '+56912345678',
        'Vendedor Asignado': 'María González',
        'Fecha de la Reunión': '2024-01-15',
        closed: '1',
      };

      const result = validator.validateClientMeetingCsvRow(row, 1);

      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('correo');
    });

    it('should handle missing required fields', () => {
      const row: CsvRow = {
        Nombre: 'Juan Pérez',
        // Missing email and other required fields
      };

      const result = validator.validateClientMeetingCsvRow(row, 1);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should accept column name variants', () => {
      const row: CsvRow = {
        nombre: 'Test',
        correo: 'test@example.com',
        telefono: '123456',
        vendedor: 'Vendor',
        fecha: '2024-01-01',
        cerrado: '1',
      };

      const result = validator.validateClientMeetingCsvRow(row, 1);

      expect(result.isValid).toBe(true);
      expect(result.data).toBeDefined();
    });

    it('should parse boolean values correctly', () => {
      const testCases = [
        { value: '1', expected: true },
        { value: '0', expected: false },
        { value: 'true', expected: true },
        { value: 'false', expected: false },
        { value: 'yes', expected: true },
        { value: 'no', expected: false },
      ];

      testCases.forEach(({ value, expected }) => {
        const row: CsvRow = {
          Nombre: 'Test',
          correo: 'test@example.com',
          telefono: '123',
          vendedor: 'Vendor',
          fecha: '2024-01-01',
          closed: value,
        };

        const result = validator.validateClientMeetingCsvRow(row, 1);

        expect(result.isValid).toBe(true);
        expect(result.data?.cerrado).toBe(expected);
      });
    });

    it('should trim whitespace from values', () => {
      const row: CsvRow = {
        Nombre: '  Juan Pérez  ',
        correo: '  juan@example.com  ',
        telefono: '  123456  ',
        vendedor: '  Vendor  ',
        fecha: '  2024-01-01  ',
        closed: '1',
      };

      const result = validator.validateClientMeetingCsvRow(row, 1);

      expect(result.isValid).toBe(true);
      expect(result.data?.nombre).toBe('Juan Pérez');
      expect(result.data?.correo).toBe('juan@example.com');
      expect(result.data?.telefono).toBe('123456');
    });

    it('should handle optional transcription field', () => {
      const rowWithTranscription: CsvRow = {
        Nombre: 'Test',
        correo: 'test@example.com',
        telefono: '123',
        vendedor: 'Vendor',
        fecha: '2024-01-01',
        closed: '1',
        Transcripción: 'Test content',
      };

      const rowWithoutTranscription: CsvRow = {
        Nombre: 'Test',
        correo: 'test@example.com',
        telefono: '123',
        vendedor: 'Vendor',
        fecha: '2024-01-01',
        closed: '1',
      };

      const result1 = validator.validateClientMeetingCsvRow(
        rowWithTranscription,
        1,
      );
      const result2 = validator.validateClientMeetingCsvRow(
        rowWithoutTranscription,
        2,
      );

      expect(result1.isValid).toBe(true);
      expect(result1.data?.transcripcion).toBe('Test content');

      expect(result2.isValid).toBe(true);
      expect(result2.data?.transcripcion).toBeUndefined();
    });
  });
});
