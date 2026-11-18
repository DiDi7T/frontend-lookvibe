import type { Service } from '../../domain/entities/service';
import type { ServiceRepository } from '../repositories/service-repository';

export class GetBusinessServicesUseCase {
  constructor(private readonly services: ServiceRepository) {}

  async execute(businessId: string): Promise<Service[]> {
    const services = await this.services.findByBusiness(businessId);
    return sortByPrice(services);
  }
}

export function sortByPrice(services: Service[]): Service[] {
  return [...services].sort(
    (left, right) => left.price.amount - right.price.amount || left.name.localeCompare(right.name, 'es'),
  );
}
