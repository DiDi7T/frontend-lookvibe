import { InvalidPortfolioError } from '../errors/invalid-portfolio-error';
import { PhotoUrl } from '../value-objects/photo-url';

export interface PortfolioItemInput {
  id: string;
  photoUrl: string;
  description: string | null;
  createdAt: string;
}

export class PortfolioItem {
  private constructor(
    readonly id: string,
    readonly photoUrl: PhotoUrl,
    readonly description: string | null,
    readonly createdAt: Date,
  ) {}

  static create(input: PortfolioItemInput): PortfolioItem {
    const id = input.id.trim();
    if (!id) throw new InvalidPortfolioError('La foto del portafolio no tiene un identificador válido.');
    const createdAt = new Date(input.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      throw new InvalidPortfolioError('La fecha de la foto del portafolio no es válida.');
    }
    return new PortfolioItem(id, PhotoUrl.create(input.photoUrl), input.description?.trim() || null, createdAt);
  }
}
