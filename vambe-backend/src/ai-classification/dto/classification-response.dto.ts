import { ClientClassification } from '../interfaces/classification.interface';

export class ClassificationResponseDto {
  totalClients: number;
  classifications: ClientClassification[];
  processingTime: number;

  constructor(
    totalClients: number,
    classifications: ClientClassification[],
    processingTime: number,
  ) {
    this.totalClients = totalClients;
    this.classifications = classifications;
    this.processingTime = processingTime;
  }
}
