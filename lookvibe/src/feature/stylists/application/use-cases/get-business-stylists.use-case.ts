import type { Stylist } from '../../domain/entities/stylist';
import type { StylistRepository } from '../repositories/stylist-repository';

export class GetBusinessStylistsUseCase {
  constructor(private readonly stylists: StylistRepository) {}

  async execute(businessId: string): Promise<Stylist[]> {
    return sortByName(await this.stylists.findByBusiness(businessId));
  }
}

export function sortByName(stylists: Stylist[]): Stylist[] {
  return [...stylists].sort((left, right) => left.displayName.localeCompare(right.displayName, 'es'));
}
