import type { Business } from '../../domain/entities/business';
import type { BusinessRepository } from '../repositories/business-repository';

export class GetMyBusinessesUseCase {
  constructor(private readonly businesses: BusinessRepository) {}

  async execute(): Promise<Business[]> {
    const mine = await this.businesses.findMine();
    return [...mine].sort((left, right) => left.name.localeCompare(right.name, 'es'));
  }
}
