import type { Business } from '../../domain/entities/business';
import { InvalidBusinessError } from '../../domain/errors/invalid-business-error';
import { BusinessLocation } from '../../domain/value-objects/business-location';
import { BusinessPage } from '../../domain/value-objects/business-page';
import { SearchRadius } from '../../domain/value-objects/search-radius';
import type { BusinessFilters, BusinessRepository } from '../repositories/business-repository';

export interface SearchBusinessesInput {
  readonly query?: string;
  readonly service?: string;
  readonly near?: { readonly latitude: number; readonly longitude: number; readonly radiusKm: number };
  readonly maxPrice?: number;
  readonly page?: number;
  readonly pageSize?: number;
}

export interface BusinessSearchResult {
  readonly business: Business;
  readonly distanceKm: number | null;
}

export class SearchBusinessesUseCase {
  constructor(private readonly businesses: BusinessRepository) {}

  async execute(input: SearchBusinessesInput): Promise<BusinessPage<BusinessSearchResult>> {
    if (input.maxPrice !== undefined && (!Number.isFinite(input.maxPrice) || input.maxPrice <= 0)) {
      throw new InvalidBusinessError('El precio máximo debe ser mayor a cero.');
    }

    const origin = input.near ? BusinessLocation.create(input.near.latitude, input.near.longitude) : null;
    const filters: BusinessFilters = {
      service: input.service?.trim() || undefined,
      near: origin && input.near ? { location: origin, radius: SearchRadius.create(input.near.radiusKm) } : undefined,
    };

    const found = await this.businesses.findAll(filters);
    const results = found
      .filter((business) => business.matches(input.query ?? ''))
      .filter((business) => input.maxPrice === undefined || business.hasServiceUpTo(input.maxPrice))
      .map((business) => ({ business, distanceKm: origin ? business.distanceKmFrom(origin) : null }))
      .sort((left, right) =>
        origin
          ? (left.distanceKm ?? Infinity) - (right.distanceKm ?? Infinity)
          : left.business.name.localeCompare(right.business.name, 'es'),
      );

    return BusinessPage.paginate(results, input.page ?? 1, input.pageSize ?? 6);
  }
}
