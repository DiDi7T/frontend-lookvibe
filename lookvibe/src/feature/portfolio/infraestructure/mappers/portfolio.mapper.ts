import { PortfolioItem } from '../../domain/entities/portfolio-item';
import type { PortfolioDraft } from '../../domain/value-objects/portfolio-draft';
import type { PortfolioOwner } from '../../domain/value-objects/portfolio-owner';
import type { PortfolioItemDto, PortfolioRequestDto } from '../dtos/portfolio.dto';

export function portfolioItemToDomain(dto: PortfolioItemDto): PortfolioItem {
  return PortfolioItem.create({
    id: dto.id,
    photoUrl: dto.fotoUrl,
    description: dto.descripcion,
    createdAt: dto.createdAt,
  });
}

export function portfolioDraftToDto(draft: PortfolioDraft): PortfolioRequestDto {
  return {
    fotoUrl: draft.photoUrl.value,
    ...(draft.description ? { descripcion: draft.description } : {}),
  };
}

export function ownerPath(owner: PortfolioOwner): string {
  const resource = owner.kind === 'business' ? 'negocios' : 'estilistas';
  return `/${resource}/${encodeURIComponent(owner.id)}/portafolio`;
}
