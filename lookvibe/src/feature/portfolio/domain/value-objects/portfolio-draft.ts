import { InvalidPortfolioError } from '../errors/invalid-portfolio-error';
import { PhotoUrl } from './photo-url';

export interface PortfolioDraftInput {
  photoUrl: string;
  description: string;
}

const MAX_DESCRIPTION = 255;

export class PortfolioDraft {
  private constructor(
    readonly photoUrl: PhotoUrl,
    readonly description: string | null,
  ) {}

  static create(input: PortfolioDraftInput): PortfolioDraft {
    const description = input.description.trim();
    if (description.length > MAX_DESCRIPTION) {
      throw new InvalidPortfolioError('La descripción no puede superar 255 caracteres.');
    }
    return new PortfolioDraft(PhotoUrl.create(input.photoUrl), description || null);
  }
}
