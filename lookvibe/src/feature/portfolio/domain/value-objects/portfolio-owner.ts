import { InvalidPortfolioError } from '../errors/invalid-portfolio-error';

export type PortfolioOwnerKind = 'business' | 'stylist';

export class PortfolioOwner {
  private constructor(
    readonly kind: PortfolioOwnerKind,
    readonly id: string,
  ) {}

  static create(kind: PortfolioOwnerKind, id: string): PortfolioOwner {
    const ownerId = id.trim();
    if (!ownerId) throw new InvalidPortfolioError('El portafolio debe pertenecer a un negocio o a un estilista.');
    return new PortfolioOwner(kind, ownerId);
  }
}
