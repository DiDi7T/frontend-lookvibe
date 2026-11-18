import type { Business } from '../../domain/entities/business';
import { BusinessNotFoundError } from '../../domain/errors/business-not-found-error';
import type { BusinessRepository } from '../repositories/business-repository';

export class GetMyBusinessUseCase {
  constructor(private readonly businesses: BusinessRepository) {}

  async execute(id: string): Promise<Business> {
    const mine = await this.businesses.findMine();
    const business = mine.find((item) => item.id === id);
    if (!business) throw new BusinessNotFoundError(id);
    return business;
  }
}
