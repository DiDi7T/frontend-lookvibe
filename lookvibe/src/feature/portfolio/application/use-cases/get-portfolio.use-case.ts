import type { PortfolioItem } from '../../domain/entities/portfolio-item';
import { PortfolioOwner, type PortfolioOwnerKind } from '../../domain/value-objects/portfolio-owner';
import type { PortfolioRepository } from '../repositories/portfolio-repository';

export class GetPortfolioUseCase {
  constructor(private readonly portfolio: PortfolioRepository) {}

  async execute(kind: PortfolioOwnerKind, ownerId: string): Promise<PortfolioItem[]> {
    const items = await this.portfolio.findByOwner(PortfolioOwner.create(kind, ownerId));
    return [...items].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  }
}
