import { InvalidBusinessError } from '../errors/invalid-business-error';

export const SEARCH_RADIUS_OPTIONS_KM = [2, 5, 10, 20] as const;

export class SearchRadius {
  private constructor(readonly kilometers: number) {}

  static create(kilometers: number): SearchRadius {
    if (!Number.isFinite(kilometers) || kilometers <= 0 || kilometers > 50) {
      throw new InvalidBusinessError('El radio de búsqueda debe estar entre 0 y 50 km.');
    }
    return new SearchRadius(kilometers);
  }
}
