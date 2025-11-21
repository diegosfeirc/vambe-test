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

export interface ClientClassification {
  clientName: string;
  email: string;
  industry: IndustryVertical;
  leadSource: LeadSource;
  interactionVolume: InteractionVolume;
  mainPainPoint: MainPainPoint;
  techMaturity: TechMaturity;
  urgency: Urgency;
  confidence: number; // 0-1 score de confianza de la IA
}

export interface ClassificationResult {
  totalClients: number;
  classifications: ClientClassification[];
  processingTime: number; // milliseconds
}
