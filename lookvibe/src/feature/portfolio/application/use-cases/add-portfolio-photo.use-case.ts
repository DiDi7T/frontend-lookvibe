import type { PortfolioItem } from '../../domain/entities/portfolio-item';
import { PortfolioDraft, type PortfolioDraftInput } from '../../domain/value-objects/portfolio-draft';
import { PortfolioOwner, type PortfolioOwnerKind } from '../../domain/value-objects/portfolio-owner';
import type { PortfolioRepository } from '../repositories/portfolio-repository';

export interface AddPortfolioPhotoInput extends PortfolioDraftInput {
  readonly ownerKind: PortfolioOwnerKind;
  readonly ownerId: string;
}

export class AddPortfolioPhotoUseCase {
  constructor(private readonly portfolio: PortfolioRepository) {}

  async execute(input: AddPortfolioPhotoInput): Promise<PortfolioItem> {
    const owner = PortfolioOwner.create(input.ownerKind, input.ownerId);
    return this.portfolio.add(owner, PortfolioDraft.create(input));
  }
}
