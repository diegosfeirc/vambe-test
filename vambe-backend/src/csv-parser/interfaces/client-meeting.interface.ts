export interface ClientMeeting {
  nombre: string;
  correo: string;
  telefono: string;
  vendedorAsignado: string;
  fechaReunion: string;
  cerrado: boolean;
  transcripcion?: string;
}

export interface CsvRow {
  [key: string]: string;
}

export interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export interface CsvParseResult {
  totalRows: number;
  validRows: number;
  data: ClientMeeting[];
  errors: ValidationError[];
}
