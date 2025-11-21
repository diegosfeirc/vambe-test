import { Test, TestingModule } from '@nestjs/testing';
import { AiClassificationService } from './ai-classification.service';
import { ClientMeeting } from '../csv-parser/interfaces/client-meeting.interface';
import {
  IndustryVertical,
  LeadSource,
  InteractionVolume,
  MainPainPoint,
  TechMaturity,
  Urgency,
} from './interfaces/classification.interface';

describe('AiClassificationService', () => {
  let service: AiClassificationService;

  beforeEach(async () => {
    // Mock Gemini API key for testing
    process.env.GEMINI_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [AiClassificationService],
    }).compile();

    service = module.get<AiClassificationService>(AiClassificationService);
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if GEMINI_API_KEY is not set', () => {
    delete process.env.GEMINI_API_KEY;

    expect(() => {
      new AiClassificationService();
    }).toThrow('GEMINI_API_KEY environment variable is not set');
  });

  describe('classifyClients', () => {
    it('should handle empty clients array', async () => {
      const clients: ClientMeeting[] = [];

      // Mock the OpenAI call to avoid actual API requests
      jest.spyOn(service as any, 'callGemini').mockResolvedValue([]);

      const result = await service.classifyClients(clients);

      expect(result.totalClients).toBe(0);
      expect(result.classifications).toEqual([]);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should classify clients successfully', async () => {
      const mockClients: ClientMeeting[] = [
        {
          nombre: 'Juan Pérez',
          correo: 'juan@example.com',
          telefono: '1234567890',
          vendedorAsignado: 'Vendedor 1',
          fechaReunion: '2024-01-15',
          cerrado: false,
          transcripcion:
            'Tenemos una tienda online de artículos deportivos con 1000 consultas mensuales',
        },
      ];

      const mockClassifications = [
        {
          clientName: 'Juan Pérez',
          email: 'juan@example.com',
          industry: IndustryVertical.ECOMMERCE_RETAIL,
          leadSource: LeadSource.WEB_SEARCH,
          interactionVolume: InteractionVolume.MEDIUM,
          mainPainPoint: MainPainPoint.EFFICIENCY_OVERLOAD,
          techMaturity: TechMaturity.ECOMMERCE_PLATFORM,
          urgency: Urgency.MEDIUM,
          confidence: 0.9,
        },
      ];

      jest
        .spyOn(service as any, 'callGemini')
        .mockResolvedValue(mockClassifications);

      const result = await service.classifyClients(mockClients);

      expect(result.totalClients).toBe(1);
      expect(result.classifications).toEqual(mockClassifications);
      expect(result.processingTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle clients without transcription', async () => {
      const mockClients: ClientMeeting[] = [
        {
          nombre: 'María García',
          correo: 'maria@example.com',
          telefono: '0987654321',
          vendedorAsignado: 'Vendedor 2',
          fechaReunion: '2024-01-20',
          cerrado: true,
        },
      ];

      const mockClassifications = [
        {
          clientName: 'María García',
          email: 'maria@example.com',
          industry: IndustryVertical.PROFESSIONAL_SERVICES,
          leadSource: LeadSource.REFERRAL,
          interactionVolume: InteractionVolume.LOW,
          mainPainPoint: MainPainPoint.SCALABILITY,
          techMaturity: TechMaturity.MANUAL_MANAGEMENT,
          urgency: Urgency.LOW,
          confidence: 0.5,
        },
      ];

      jest
        .spyOn(service as any, 'callGemini')
        .mockResolvedValue(mockClassifications);

      const result = await service.classifyClients(mockClients);

      expect(result.totalClients).toBe(1);
      expect(result.classifications.length).toBe(1);
    });
  });

  describe('validation methods', () => {
    it('should return valid industry enum value', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = (service as any).validateIndustry('Salud');
      expect(result).toBe(IndustryVertical.HEALTHCARE);
    });

    it('should return default for invalid industry value', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = (service as any).validateIndustry('Invalid Value');
      expect(result).toBe(IndustryVertical.PROFESSIONAL_SERVICES);
    });

    it('should return valid leadSource enum value', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = (service as any).validateLeadSource(
        'Evento / Conferencia',
      );
      expect(result).toBe(LeadSource.EVENT_CONFERENCE);
    });

    it('should return default for invalid leadSource value', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const result = (service as any).validateLeadSource('Invalid Value');
      expect(result).toBe(LeadSource.WEB_SEARCH);
    });
  });

  describe('validateConfidence', () => {
    it('should return valid confidence value', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect((service as any).validateConfidence(0.85)).toBe(0.85);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect((service as any).validateConfidence(0)).toBe(0);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect((service as any).validateConfidence(1)).toBe(1);
    });

    it('should return 0.5 for invalid confidence values', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect((service as any).validateConfidence(-0.5)).toBe(0.5);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect((service as any).validateConfidence(1.5)).toBe(0.5);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      expect((service as any).validateConfidence('invalid' as any)).toBe(0.5);
    });
  });
});
