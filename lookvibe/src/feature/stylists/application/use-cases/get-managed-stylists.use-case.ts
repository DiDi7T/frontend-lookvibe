import type { Stylist } from '../../domain/entities/stylist';
import type { StylistRepository } from '../repositories/stylist-repository';
import { sortByName } from './get-business-stylists.use-case';

export class GetManagedStylistsUseCase {
  constructor(private readonly stylists: StylistRepository) {}

  async execute(businessId: string): Promise<Stylist[]> {
    return sortByName(await this.stylists.findManaged(businessId));
  }
}
