import type { Service } from '../../domain/entities/service';
import type { ServiceRepository } from '../repositories/service-repository';
import { sortByPrice } from './get-business-services.use-case';

export class GetManagedServicesUseCase {
  constructor(private readonly services: ServiceRepository) {}

  async execute(businessId: string): Promise<Service[]> {
    return sortByPrice(await this.services.findManaged(businessId));
  }
}
