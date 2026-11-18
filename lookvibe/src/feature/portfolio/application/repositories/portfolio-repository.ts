import type { PortfolioItem } from '../../domain/entities/portfolio-item';
import type { PortfolioDraft } from '../../domain/value-objects/portfolio-draft';
import type { PortfolioOwner } from '../../domain/value-objects/portfolio-owner';

export interface PortfolioRepository {
  findByOwner(owner: PortfolioOwner): Promise<PortfolioItem[]>;
  add(owner: PortfolioOwner, draft: PortfolioDraft): Promise<PortfolioItem>;
}
