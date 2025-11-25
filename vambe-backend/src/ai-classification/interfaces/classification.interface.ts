import { ApiProperty } from '@nestjs/swagger';

export enum IndustryVertical {
  ECOMMERCE_RETAIL = 'E-commerce / Retail',
  HEALTHCARE = 'Salud',
  FINANCE = 'Finanzas',
  EDUCATION = 'Educación',
  TOURISM = 'Turismo',
  LOGISTICS = 'Logística',
  TECH_SAAS = 'Tecnología / SaaS',
  PROFESSIONAL_SERVICES = 'Servicios Profesionales',
}

export enum LeadSource {
  EVENT_CONFERENCE = 'Evento / Conferencia',
  REFERRAL = 'Referido / Boca a Boca',
  WEB_SEARCH = 'Búsqueda Web / Google',
  CONTENT = 'Contenido (Blog/Podcast/Prensa)',
  SOCIAL_MEDIA = 'Redes Sociales',
}

export enum InteractionVolume {
  LOW = 'Bajo (< 500 mes)',
  MEDIUM = 'Medio (500 - 2000 mes)',
  HIGH = 'Alto (> 2000 mes)',
}

export enum MainPainPoint {
  EFFICIENCY_OVERLOAD = 'Eficiencia / Sobrecarga',
  EXPERIENCE_PERSONALIZATION = 'Experiencia / Personalización',
  AVAILABILITY_24_7 = 'Disponibilidad 24/7',
  SCALABILITY = 'Escalabilidad',
}

export enum TechMaturity {
  MANUAL_MANAGEMENT = 'Gestión Manual',
  APPOINTMENT_SYSTEM = 'Sistema de Citas/Reservas',
  ECOMMERCE_PLATFORM = 'E-commerce/Plataforma',
  CRM_SUPPORT = 'CRM/Soporte',
}

export enum Urgency {
  HIGH = 'Alta (Temporada/Pico)',
  MEDIUM = 'Media (Crecimiento constante)',
  LOW = 'Baja (Exploración)',
}

export class ClientClassification {
  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez',
    type: String,
  })
  clientName: string;

  @ApiProperty({
    description: 'Correo electrónico del cliente',
    example: 'juan.perez@example.com',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'Número de teléfono del cliente',
    example: '+56912345678',
    type: String,
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Fecha de la reunión en formato ISO 8601',
    example: '2024-01-15T10:00:00Z',
    type: String,
    required: false,
  })
  meetingDate?: string;

  @ApiProperty({
    description: 'Nombre del vendedor asignado al cliente',
    example: 'María González',
    type: String,
    required: false,
  })
  assignedSalesperson?: string;

  @ApiProperty({
    description: 'Indica si el cliente ha cerrado el trato',
    example: false,
    type: Boolean,
    required: false,
  })
  isClosed?: boolean;

  @ApiProperty({
    description: 'Vertical de industria del cliente',
    enum: IndustryVertical,
    example: IndustryVertical.ECOMMERCE_RETAIL,
  })
  industry: IndustryVertical;

  @ApiProperty({
    description: 'Fuente del lead',
    enum: LeadSource,
    example: LeadSource.WEB_SEARCH,
  })
  leadSource: LeadSource;

  @ApiProperty({
    description: 'Volumen de interacciones del cliente',
    enum: InteractionVolume,
    example: InteractionVolume.MEDIUM,
  })
  interactionVolume: InteractionVolume;

  @ApiProperty({
    description: 'Principal punto de dolor del cliente',
    enum: MainPainPoint,
    example: MainPainPoint.EFFICIENCY_OVERLOAD,
  })
  mainPainPoint: MainPainPoint;

  @ApiProperty({
    description: 'Nivel de madurez tecnológica del cliente',
    enum: TechMaturity,
    example: TechMaturity.APPOINTMENT_SYSTEM,
  })
  techMaturity: TechMaturity;

  @ApiProperty({
    description: 'Nivel de urgencia del cliente',
    enum: Urgency,
    example: Urgency.HIGH,
  })
  urgency: Urgency;

  @ApiProperty({
    description: 'Score de confianza de la clasificación de IA (0-1)',
    example: 0.95,
    type: Number,
    minimum: 0,
    maximum: 1,
  })
  confidence: number;
}

export interface ClassificationResult {
  totalClients: number;
  classifications: ClientClassification[];
  processingTime: number; // milliseconds
}

export interface AIClassificationResponse {
  clientName: string;
  email: string;
  phone: string;
  meetingDate: string;
  assignedSalesperson: string;
  isClosed: boolean;
  industry: string;
  leadSource: string;
  interactionVolume: string;
  mainPainPoint: string;
  techMaturity: string;
  urgency: string;
  confidence: number;
}
