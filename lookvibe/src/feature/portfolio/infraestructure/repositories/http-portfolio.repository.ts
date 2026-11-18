import type { HttpClient } from '../../../../shared/infrastructure/http-client';
import type { PortfolioRepository } from '../../application/repositories/portfolio-repository';
import type { PortfolioItem } from '../../domain/entities/portfolio-item';
import type { PortfolioDraft } from '../../domain/value-objects/portfolio-draft';
import type { PortfolioOwner } from '../../domain/value-objects/portfolio-owner';
import type { PortfolioItemDto } from '../dtos/portfolio.dto';
import { ownerPath, portfolioDraftToDto, portfolioItemToDomain } from '../mappers/portfolio.mapper';

export class HttpPortfolioRepository implements PortfolioRepository {
  constructor(private readonly http: HttpClient) {}

  async findByOwner(owner: PortfolioOwner): Promise<PortfolioItem[]> {
    const items = await this.http.get<PortfolioItemDto[]>(ownerPath(owner));
    return items.map(portfolioItemToDomain);
  }

  async add(owner: PortfolioOwner, draft: PortfolioDraft): Promise<PortfolioItem> {
    return portfolioItemToDomain(await this.http.post<PortfolioItemDto>(ownerPath(owner), portfolioDraftToDto(draft)));
  }
}
