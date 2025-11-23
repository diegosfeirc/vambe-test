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
  AIClassificationResponse,
} from './interfaces/classification.interface';
import {
  ThreeSRecommendations,
  ClassificationStats,
} from './interfaces/three-s.interface';

@Injectable()
export class AiClassificationService {
  private readonly logger = new Logger(AiClassificationService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: GenerativeModel;
  private readonly creativeModel: GenerativeModel;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);

    // Modelo para clasificación estructurada (baja temperatura para consistencia)
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.1, // Baja temperatura para consistencia en clasificación
      },
    });

    // Modelo para recomendaciones creativas (mayor temperatura para análisis estratégico)
    this.creativeModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.7, // Mayor temperatura para recomendaciones más creativas y variadas
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
      const classifications = await this.callGemini(prompt, clients);
      const processingTime = Date.now() - startTime;

      this.logger.log(
        `Classification completed in ${processingTime}ms for ${classifications.length} clients`,
      );

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

  private async callGemini(
    prompt: string,
    clients: ClientMeeting[],
  ): Promise<ClientClassification[]> {
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

      return this.validateAndTransformClassifications(
        rawClassifications,
        clients,
      );
    } catch (error) {
      this.logger.error('Error calling Gemini API', error);
      throw new Error(
        `Failed to get classification from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private validateAndTransformClassifications(
    rawData: AIClassificationResponse[],
    clients: ClientMeeting[],
  ): ClientClassification[] {
    return rawData.map((item) => {
      // Buscar el cliente original por email para obtener los campos adicionales
      const originalClient = clients.find(
        (client) => client.correo.toLowerCase() === item.email.toLowerCase(),
      );

      return {
        clientName: item.clientName,
        email: item.email,
        phone: originalClient?.telefono,
        meetingDate: originalClient?.fechaReunion,
        assignedSalesperson: originalClient?.vendedorAsignado,
        isClosed: originalClient?.cerrado,
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

  async generateThreeSRecommendations(
    classifications: ClientClassification[],
  ): Promise<ThreeSRecommendations> {
    const startTime = Date.now();

    this.logger.log(
      `Generating 3S recommendations for ${classifications.length} classifications`,
    );

    try {
      const prompt = this.buildThreeSPrompt(classifications);
      const recommendations = await this.callGeminiForThreeS(prompt);
      const processingTime = Date.now() - startTime;

      this.logger.log(`3S recommendations generated in ${processingTime}ms`);

      return {
        start: recommendations.start,
        stop: recommendations.stop,
        spiceUp: recommendations.spiceUp,
        processingTime,
      };
    } catch (error) {
      this.logger.error('Error generating 3S recommendations', error);
      throw error;
    }
  }

  private analyzeClassificationStats(
    classifications: ClientClassification[],
  ): ClassificationStats {
    const stats: ClassificationStats = {
      closedCount: 0,
      closedPercentage: 0,
      industryDistribution: {},
      leadSourceDistribution: {},
      volumeDistribution: {},
      painPointDistribution: {},
      urgencyDistribution: {},
    };

    classifications.forEach((classification) => {
      if (classification.isClosed) {
        stats.closedCount++;
      }

      const industry = classification.industry;
      stats.industryDistribution[industry] =
        (stats.industryDistribution[industry] || 0) + 1;

      const leadSource = classification.leadSource;
      stats.leadSourceDistribution[leadSource] =
        (stats.leadSourceDistribution[leadSource] || 0) + 1;

      const volume = classification.interactionVolume;
      stats.volumeDistribution[volume] =
        (stats.volumeDistribution[volume] || 0) + 1;

      const painPoint = classification.mainPainPoint;
      stats.painPointDistribution[painPoint] =
        (stats.painPointDistribution[painPoint] || 0) + 1;

      const urgency = classification.urgency;
      stats.urgencyDistribution[urgency] =
        (stats.urgencyDistribution[urgency] || 0) + 1;
    });

    stats.closedPercentage =
      classifications.length > 0
        ? Math.round((stats.closedCount / classifications.length) * 100)
        : 0;

    return stats;
  }

  private buildThreeSPrompt(classifications: ClientClassification[]): string {
    const stats = this.analyzeClassificationStats(classifications);

    // Limitar la cantidad de datos enviados para optimizar el prompt
    const maxClassificationsToSend = 50;
    const classificationsToSend =
      classifications.length > maxClassificationsToSend
        ? classifications.slice(0, maxClassificationsToSend)
        : classifications;

    const systemContext = `Eres un experto consultor de ventas y estrategia para Vambe AI, una empresa que ofrece soluciones de automatización con IA para atención al cliente.

Analiza los siguientes datos de clasificación de leads y genera recomendaciones estratégicas usando la metodología "3 S" (Start, Stop, Spice Up).

CONTEXTO DE LOS DATOS:
- Total de leads: ${classifications.length}
- Leads cerrados: ${stats.closedCount} (${stats.closedPercentage}%)
- Distribución por industria: ${JSON.stringify(stats.industryDistribution)}
- Distribución por fuente: ${JSON.stringify(stats.leadSourceDistribution)}
- Volumen de interacción: ${JSON.stringify(stats.volumeDistribution)}
- Dolores principales: ${JSON.stringify(stats.painPointDistribution)}
- Urgencia: ${JSON.stringify(stats.urgencyDistribution)}

DATOS DE CLASIFICACIÓN:
${JSON.stringify(classificationsToSend, null, 2)}${
      classifications.length > maxClassificationsToSend
        ? `\n... (mostrando primeros ${maxClassificationsToSend} de ${classifications.length})`
        : ''
    }

INSTRUCCIONES:
Genera recomendaciones concretas y accionables basadas en los patrones que observes en los datos. Cada recomendación debe ser específica, práctica y orientada a mejorar el desempeño de ventas.

FORMATO DE RESPUESTA:
Debes responder ÚNICAMENTE con un JSON válido (sin markdown, sin explicaciones adicionales) con esta estructura:

{
  "start": [
    {
      "title": "Título de 5-7 palabras",
      "description": "Descripción completa y detallada de la recomendación, explicando qué empezar a hacer, por qué es importante y cómo implementarlo."
    },
    {
      "title": "Segundo título de 5-7 palabras",
      "description": "Segunda descripción completa y detallada..."
    },
    {
      "title": "Tercer título de 5-7 palabras",
      "description": "Tercera descripción completa y detallada..."
    }
  ],
  "stop": [
    {
      "title": "Título de 5-7 palabras",
      "description": "Descripción completa explicando qué dejar de hacer, por qué está obstaculizando y qué impacto tendrá detenerlo."
    },
    {
      "title": "Segundo título de 5-7 palabras",
      "description": "Segunda descripción completa..."
    },
    {
      "title": "Tercer título de 5-7 palabras",
      "description": "Tercera descripción completa..."
    }
  ],
  "spiceUp": [
    {
      "title": "Título de 5-7 palabras",
      "description": "Descripción completa explicando cómo mejorar algo que ya funciona bien, qué optimizaciones hacer y el impacto esperado."
    },
    {
      "title": "Segundo título de 5-7 palabras",
      "description": "Segunda descripción completa..."
    },
    {
      "title": "Tercer título de 5-7 palabras",
      "description": "Tercera descripción completa..."
    }
  ]
}

IMPORTANTE:
- Cada array (start, stop, spiceUp) debe contener EXACTAMENTE 3 recomendaciones
- Cada recomendación debe tener un "title" de 5-7 palabras que resuma la recomendación
- Cada recomendación debe tener una "description" completa y detallada (mínimo 2-3 oraciones) que explique la recomendación en profundidad`;

    return systemContext;
  }

  private async callGeminiForThreeS(prompt: string): Promise<{
    start: Array<{ title: string; description: string }>;
    stop: Array<{ title: string; description: string }>;
    spiceUp: Array<{ title: string; description: string }>;
  }> {
    try {
      // Usar creativeModel para generar recomendaciones más creativas y variadas
      const result = await this.creativeModel.generateContent(prompt);
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

      this.logger.debug(
        `Gemini 3S raw response: ${content.substring(0, 200)}...`,
      );

      const parsed = JSON.parse(content) as {
        start?: unknown[];
        stop?: unknown[];
        spiceUp?: unknown[];
      };

      // Validar estructura de respuesta
      if (
        !parsed.start ||
        !parsed.stop ||
        !parsed.spiceUp ||
        !Array.isArray(parsed.start) ||
        !Array.isArray(parsed.stop) ||
        !Array.isArray(parsed.spiceUp)
      ) {
        throw new Error('Invalid response structure from Gemini');
      }

      // Validar que cada array tenga exactamente 3 elementos
      if (
        parsed.start.length !== 3 ||
        parsed.stop.length !== 3 ||
        parsed.spiceUp.length !== 3
      ) {
        throw new Error(
          `Expected exactly 3 recommendations per category, got start: ${parsed.start.length}, stop: ${parsed.stop.length}, spiceUp: ${parsed.spiceUp.length}`,
        );
      }

      // Validar estructura de cada recomendación
      const validateRecommendation = (
        item: unknown,
      ): { title: string; description: string } => {
        if (
          typeof item === 'object' &&
          item !== null &&
          'title' in item &&
          'description' in item &&
          typeof (item as { title: unknown }).title === 'string' &&
          typeof (item as { description: unknown }).description === 'string'
        ) {
          const rec = item as { title: string; description: string };
          if (!rec.title.trim() || !rec.description.trim()) {
            throw new Error(
              'Recommendation title and description cannot be empty',
            );
          }
          return {
            title: rec.title.trim(),
            description: rec.description.trim(),
          };
        }
        throw new Error('Invalid recommendation structure');
      };

      return {
        start: parsed.start.map(validateRecommendation),
        stop: parsed.stop.map(validateRecommendation),
        spiceUp: parsed.spiceUp.map(validateRecommendation),
      };
    } catch (error) {
      this.logger.error('Error calling Gemini API for 3S', error);
      throw new Error(
        `Failed to get 3S recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
