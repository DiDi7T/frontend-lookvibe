import type { Service } from '../../domain/entities/service';
import { InvalidServiceError } from '../../domain/errors/invalid-service-error';
import { ServiceDraft, type ServiceDraftInput } from '../../domain/value-objects/service-draft';
import type { ServiceRepository } from '../repositories/service-repository';

export interface CreateServiceInput extends ServiceDraftInput {
  readonly businessId: string;
}

export class CreateServiceUseCase {
  constructor(private readonly services: ServiceRepository) {}

  async execute(input: CreateServiceInput): Promise<Service> {
    const businessId = input.businessId.trim();
    if (!businessId) throw new InvalidServiceError('El servicio debe pertenecer a un negocio.');
    return this.services.create(businessId, ServiceDraft.create(input));
  }
}
