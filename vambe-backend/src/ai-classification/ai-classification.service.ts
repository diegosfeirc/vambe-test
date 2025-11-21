import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { ClientMeeting } from '../csv-parser/interfaces/client-meeting.interface';
import {
  ClientClassification,
  ClassificationResult,
  IndustryVertical,
  LeadSource,
  InteractionVolume,
  MainPainPoint,
  TechMaturity,
  Urgency,
} from './interfaces/classification.interface';

interface AIClassificationResponse {
  clientName: string;
  email: string;
  industry: string;
  leadSource: string;
  interactionVolume: string;
  mainPainPoint: string;
  techMaturity: string;
  urgency: string;
  confidence: number;
}

@Injectable()
export class AiClassificationService {
  private readonly logger = new Logger(AiClassificationService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        temperature: 0.1, // Baja temperatura para consistencia
      },
    });
  }

  async classifyClients(
    clients: ClientMeeting[],
  ): Promise<ClassificationResult> {
    const startTime = Date.now();

    this.logger.log(`Starting classification for ${clients.length} clients`);

    try {
      const prompt = this.buildClassificationPrompt(clients);
      const classifications = await this.callGemini(prompt);
      const processingTime = Date.now() - startTime;

      this.logger.log(
        `Classification completed in ${processingTime}ms for ${classifications.length} clients`,
      );

      console.log('\n=== CLASSIFICATION RESULT ===');
      console.log(JSON.stringify(classifications, null, 2));
      console.log('=============================\n');

      return {
        totalClients: clients.length,
        classifications,
        processingTime,
      };
    } catch (error) {
      this.logger.error('Error during classification', error);
      throw error;
    }
  }

  private buildClassificationPrompt(clients: ClientMeeting[]): string {
    const systemContext = `Eres un experto analista de datos de ventas para Vambe AI, una empresa que ofrece soluciones de automatización con IA para atención al cliente.

Tu tarea es clasificar a cada cliente en base a 6 dimensiones, utilizando ÚNICAMENTE la información proporcionada en la transcripción de la reunión.

DIMENSIONES Y CATEGORÍAS PERMITIDAS:

1. Industria / Vertical (industry):
   - "E-commerce / Retail"
   - "Salud"
   - "Finanzas"
   - "Educación"
   - "Turismo"
   - "Logística"
   - "Tecnología / SaaS"
   - "Servicios Profesionales"

2. Canal de Adquisición (leadSource):
   - "Evento / Conferencia"
   - "Referido / Boca a Boca"
   - "Búsqueda Web / Google"
   - "Contenido (Blog/Podcast/Prensa)"
   - "Redes Sociales"

3. Escala del Problema (interactionVolume):
   - "Bajo (< 500 mes)"
   - "Medio (500 - 2000 mes)"
   - "Alto (> 2000 mes)"
   (Si mencionan volúmenes semanales o diarios, normalízalos a mensual)

4. Dolor Principal (mainPainPoint):
   - "Eficiencia / Sobrecarga"
   - "Experiencia / Personalización"
   - "Disponibilidad 24/7"
   - "Escalabilidad"

5. Integración Tecnológica (techMaturity):
   - "Gestión Manual"
   - "Sistema de Citas/Reservas"
   - "E-commerce/Plataforma"
   - "CRM/Soporte"

6. Urgencia / Estacionalidad (urgency):
   - "Alta (Temporada/Pico)"
   - "Media (Crecimiento constante)"
   - "Baja (Exploración)"

IMPORTANTE:
- Debes usar EXACTAMENTE los valores listados arriba (respeta mayúsculas, acentos y caracteres especiales).
- Si la transcripción no contiene suficiente información para clasificar una dimensión, haz tu mejor inferencia basada en el contexto disponible.
- Asigna un nivel de confianza (confidence) entre 0 y 1 para cada cliente, donde 1 significa alta confianza en todas las clasificaciones.

FORMATO DE RESPUESTA:
Debes responder ÚNICAMENTE con un JSON válido (sin markdown, sin explicaciones adicionales) que contenga un array de objetos con esta estructura:

[
  {
    "clientName": "nombre del cliente",
    "email": "correo del cliente",
    "industry": "categoría exacta",
    "leadSource": "categoría exacta",
    "interactionVolume": "categoría exacta",
    "mainPainPoint": "categoría exacta",
    "techMaturity": "categoría exacta",
    "urgency": "categoría exacta",
    "confidence": 0.95
  }
]`;

    const clientsData = JSON.stringify(
      clients.map((client) => ({
        nombre: client.nombre,
        correo: client.correo,
        transcripcion: client.transcripcion || 'Sin transcripción disponible',
      })),
      null,
      2,
    );

    return `${systemContext}\n\nCLIENTES A CLASIFICAR:\n${clientsData}`;
  }

  private async callGemini(prompt: string): Promise<ClientClassification[]> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      let content = response.text();

      if (!content) {
        throw new Error('Gemini returned empty response');
      }

      // Limpiar markdown code blocks si existen
      content = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      this.logger.debug(`Gemini raw response: ${content.substring(0, 200)}...`);

      const parsed: unknown = JSON.parse(content);

      // Handle both array and object with classifications property
      let rawClassifications: AIClassificationResponse[];

      if (Array.isArray(parsed)) {
        rawClassifications = parsed as AIClassificationResponse[];
      } else if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'classifications' in parsed &&
        Array.isArray((parsed as { classifications: unknown }).classifications)
      ) {
        rawClassifications = (
          parsed as {
            classifications: AIClassificationResponse[];
          }
        ).classifications;
      } else {
        throw new Error('Invalid response format from Gemini');
      }

      return this.validateAndTransformClassifications(rawClassifications);
    } catch (error) {
      this.logger.error('Error calling Gemini API', error);
      throw new Error(
        `Failed to get classification from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private validateAndTransformClassifications(
    rawData: AIClassificationResponse[],
  ): ClientClassification[] {
    return rawData.map((item) => {
      return {
        clientName: item.clientName,
        email: item.email,
        industry: this.validateIndustry(item.industry),
        leadSource: this.validateLeadSource(item.leadSource),
        interactionVolume: this.validateInteractionVolume(
          item.interactionVolume,
        ),
        mainPainPoint: this.validateMainPainPoint(item.mainPainPoint),
        techMaturity: this.validateTechMaturity(item.techMaturity),
        urgency: this.validateUrgency(item.urgency),
        confidence: this.validateConfidence(item.confidence),
      };
    });
  }

  private validateIndustry(value: string): IndustryVertical {
    const enumValues = Object.values(IndustryVertical);
    if (enumValues.includes(value as IndustryVertical)) {
      return value as IndustryVertical;
    }
    this.logger.warn(
      `Invalid industry value: "${value}". Using default: ${IndustryVertical.PROFESSIONAL_SERVICES}`,
    );
    return IndustryVertical.PROFESSIONAL_SERVICES;
  }

  private validateLeadSource(value: string): LeadSource {
    const enumValues = Object.values(LeadSource);
    if (enumValues.includes(value as LeadSource)) {
      return value as LeadSource;
    }
    this.logger.warn(
      `Invalid leadSource value: "${value}". Using default: ${LeadSource.WEB_SEARCH}`,
    );
    return LeadSource.WEB_SEARCH;
  }

  private validateInteractionVolume(value: string): InteractionVolume {
    const enumValues = Object.values(InteractionVolume);
    if (enumValues.includes(value as InteractionVolume)) {
      return value as InteractionVolume;
    }
    this.logger.warn(
      `Invalid interactionVolume value: "${value}". Using default: ${InteractionVolume.MEDIUM}`,
    );
    return InteractionVolume.MEDIUM;
  }

  private validateMainPainPoint(value: string): MainPainPoint {
    const enumValues = Object.values(MainPainPoint);
    if (enumValues.includes(value as MainPainPoint)) {
      return value as MainPainPoint;
    }
    this.logger.warn(
      `Invalid mainPainPoint value: "${value}". Using default: ${MainPainPoint.EFFICIENCY_OVERLOAD}`,
    );
    return MainPainPoint.EFFICIENCY_OVERLOAD;
  }

  private validateTechMaturity(value: string): TechMaturity {
    const enumValues = Object.values(TechMaturity);
    if (enumValues.includes(value as TechMaturity)) {
      return value as TechMaturity;
    }
    this.logger.warn(
      `Invalid techMaturity value: "${value}". Using default: ${TechMaturity.MANUAL_MANAGEMENT}`,
    );
    return TechMaturity.MANUAL_MANAGEMENT;
  }

  private validateUrgency(value: string): Urgency {
    const enumValues = Object.values(Urgency);
    if (enumValues.includes(value as Urgency)) {
      return value as Urgency;
    }
    this.logger.warn(
      `Invalid urgency value: "${value}". Using default: ${Urgency.MEDIUM}`,
    );
    return Urgency.MEDIUM;
  }

  private validateConfidence(confidence: number): number {
    if (typeof confidence === 'number' && confidence >= 0 && confidence <= 1) {
      return confidence;
    }
    this.logger.warn(`Invalid confidence value: ${confidence}. Using 0.5`);
    return 0.5;
  }
}
