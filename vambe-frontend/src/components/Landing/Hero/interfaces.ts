import { ClientClassification } from '@/components/Leads/ClassificationTable/interfaces';

export interface ClientMeeting {
    nombre: string;
    correo: string;
    telefono: string;
    vendedorAsignado: string;
    fechaReunion: string;
    cerrado: boolean;
    transcripcion?: string;
}
  
export interface ValidationError {
    row: number;
    field: string;
    value: string;
    message: string;
}

export interface ParseResult {
    totalRows: number;
    validRows: number;
    errors: ValidationError[];
}

export interface ClassificationResult {
    totalClients: number;
    classifications: ClientClassification[];
    processingTime: number;
}
  
export interface CsvUploadResponse {
    parsing: ParseResult;
    classification: ClassificationResult | null;
    data: ClientMeeting[];
}