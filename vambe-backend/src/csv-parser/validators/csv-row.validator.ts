import { Injectable } from '@nestjs/common';
import {
  ClientMeeting,
  CsvRow,
  ValidationError,
} from '../interfaces/client-meeting.interface';

interface ValidationResult {
  isValid: boolean;
  data?: ClientMeeting;
  errors: ValidationError[];
}

@Injectable()
export class CsvRowValidator {
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private readonly COLUMN_MAPPINGS = {
    nombre: ['nombre', 'Nombre'],
    correo: [
      'correo',
      'Correo',
      'Correo Electronico',
      'Correo Electrónico',
      'correo electronico',
      'correo electrónico',
    ],
    telefono: [
      'telefono',
      'Telefono',
      'Teléfono',
      'Numero de Telefono',
      'Número de Teléfono',
      'numero de telefono',
      'número de teléfono',
    ],
    fecha: [
      'fecha',
      'Fecha',
      'Fecha de la Reunion',
      'Fecha de la Reunión',
      'fecha de la reunion',
      'fecha de la reunión',
    ],
    vendedor: [
      'vendedor',
      'Vendedor',
      'Vendedor asignado',
      'Vendedor Asignado',
      'vendedor asignado',
    ],
    cerrado: ['cerrado', 'Cerrado', 'closed', 'Closed'],
    transcripcion: [
      'transcripcion',
      'Transcripcion',
      'Transcripción',
      'transcripción',
    ],
  };

  validateClientMeetingCsvRow(
    row: CsvRow,
    rowNumber: number,
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const data: Partial<ClientMeeting> = {};

    // Extract and validate nombre
    const nombre = this.extractValue(row, this.COLUMN_MAPPINGS.nombre);
    if (!nombre) {
      errors.push({
        row: rowNumber,
        field: 'nombre',
        value: '',
        message: 'El campo nombre es obligatorio',
      });
    } else {
      data.nombre = nombre.trim();
    }

    // Extract and validate correo
    const correo = this.extractValue(row, this.COLUMN_MAPPINGS.correo);
    if (!correo) {
      errors.push({
        row: rowNumber,
        field: 'correo',
        value: '',
        message: 'El campo correo es obligatorio',
      });
    } else {
      const trimmedEmail = correo.trim();
      if (!this.EMAIL_REGEX.test(trimmedEmail)) {
        errors.push({
          row: rowNumber,
          field: 'correo',
          value: trimmedEmail,
          message: 'El correo electrónico no tiene un formato válido',
        });
      } else {
        data.correo = trimmedEmail;
      }
    }

    // Extract and validate telefono
    const telefono = this.extractValue(row, this.COLUMN_MAPPINGS.telefono);
    if (!telefono) {
      errors.push({
        row: rowNumber,
        field: 'telefono',
        value: '',
        message: 'El campo teléfono es obligatorio',
      });
    } else {
      data.telefono = telefono.trim();
    }

    // Extract and validate vendedor
    const vendedor = this.extractValue(row, this.COLUMN_MAPPINGS.vendedor);
    if (!vendedor) {
      errors.push({
        row: rowNumber,
        field: 'vendedor',
        value: '',
        message: 'El campo vendedor es obligatorio',
      });
    } else {
      data.vendedorAsignado = vendedor.trim();
    }

    // Extract and validate fecha
    const fecha = this.extractValue(row, this.COLUMN_MAPPINGS.fecha);
    if (!fecha) {
      errors.push({
        row: rowNumber,
        field: 'fecha',
        value: '',
        message: 'El campo fecha es obligatorio',
      });
    } else {
      data.fechaReunion = fecha.trim();
    }

    // Extract and validate cerrado
    const cerradoValue = this.extractValue(row, this.COLUMN_MAPPINGS.cerrado);
    if (cerradoValue === null || cerradoValue === undefined) {
      errors.push({
        row: rowNumber,
        field: 'cerrado',
        value: '',
        message: 'El campo cerrado es obligatorio',
      });
    } else {
      data.cerrado = this.parseBoolean(cerradoValue);
    }

    // Extract transcripcion (optional)
    const transcripcion = this.extractValue(
      row,
      this.COLUMN_MAPPINGS.transcripcion,
    );
    if (transcripcion) {
      data.transcripcion = transcripcion.trim();
    }

    if (errors.length > 0) {
      return { isValid: false, errors };
    }

    return {
      isValid: true,
      data: data as ClientMeeting,
      errors: [],
    };
  }

  private extractValue(
    row: CsvRow,
    possibleKeys: string[],
  ): string | null | undefined {
    for (const key of possibleKeys) {
      if (key in row) {
        return row[key];
      }
    }
    return null;
  }

  private parseBoolean(value: string): boolean {
    const trimmedValue = value.trim().toLowerCase();

    // Check for numeric values
    if (trimmedValue === '1' || trimmedValue === '0') {
      return trimmedValue === '1';
    }

    // Check for boolean strings
    if (trimmedValue === 'true' || trimmedValue === 'false') {
      return trimmedValue === 'true';
    }

    // Check for yes/no variants
    if (trimmedValue === 'yes' || trimmedValue === 'no') {
      return trimmedValue === 'yes';
    }

    if (trimmedValue === 'si' || trimmedValue === 'sí') {
      return true;
    }

    // Default to false for any other value
    return false;
  }
}
