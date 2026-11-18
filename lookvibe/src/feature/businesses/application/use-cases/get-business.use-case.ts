import type { Business } from '../../domain/entities/business';
import { BusinessNotFoundError } from '../../domain/errors/business-not-found-error';
import type { BusinessRepository } from '../repositories/business-repository';

export class GetBusinessUseCase {
  constructor(private readonly businesses: BusinessRepository) {}

  async execute(id: string): Promise<Business> {
    const businessId = id.trim();
    if (!businessId) throw new BusinessNotFoundError(id);
    return this.businesses.findById(businessId);
  }
}
