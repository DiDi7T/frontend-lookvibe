import type { ServiceRepository } from '../application/repositories/service-repository';
import { Service, type ServiceInput } from '../domain/entities/service';
import type { ServiceDraft } from '../domain/value-objects/service-draft';

export function aService(overrides: Partial<ServiceInput> = {}): Service {
  return Service.create({
    id: 's-1',
    businessId: 'b-1',
    name: 'Corte clásico',
    price: 35000,
    durationMinutes: 45,
    ...overrides,
  });
}

export class InMemoryServiceRepository implements ServiceRepository {
  deleted: string[] = [];

  constructor(private services: Service[] = []) {}

  async findByBusiness(businessId: string): Promise<Service[]> {
    return this.services.filter((service) => service.businessId === businessId);
  }

  async findManaged(businessId: string): Promise<Service[]> {
    return this.findByBusiness(businessId);
  }

  async create(businessId: string, draft: ServiceDraft): Promise<Service> {
    const service = aService({
      id: `s-${this.services.length + 100}`,
      businessId,
      name: draft.name,
      price: draft.price.amount,
      durationMinutes: draft.duration.minutes,
    });
    this.services.push(service);
    return service;
  }

  async update(businessId: string, serviceId: string, draft: ServiceDraft): Promise<Service> {
    const service = aService({
      id: serviceId,
      businessId,
      name: draft.name,
      price: draft.price.amount,
      durationMinutes: draft.duration.minutes,
    });
    this.services = this.services.map((item) => (item.id === serviceId ? service : item));
    return service;
  }

  async delete(_businessId: string, serviceId: string): Promise<void> {
    this.deleted.push(serviceId);
    this.services = this.services.filter((item) => item.id !== serviceId);
  }
}
