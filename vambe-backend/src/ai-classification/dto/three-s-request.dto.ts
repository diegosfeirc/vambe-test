import { ClientClassification } from '../interfaces/classification.interface';

export class ThreeSRequestDto {
  classifications: ClientClassification[];

  constructor(classifications: ClientClassification[]) {
    this.classifications = classifications;
  }
}
