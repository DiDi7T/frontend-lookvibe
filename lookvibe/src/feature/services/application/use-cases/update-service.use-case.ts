import type { Service } from '../../domain/entities/service';
import { InvalidServiceError } from '../../domain/errors/invalid-service-error';
import { ServiceDraft, type ServiceDraftInput } from '../../domain/value-objects/service-draft';
import type { ServiceRepository } from '../repositories/service-repository';

export interface UpdateServiceInput extends ServiceDraftInput {
  readonly businessId: string;
  readonly serviceId: string;
}

export class UpdateServiceUseCase {
  constructor(private readonly services: ServiceRepository) {}

  async execute(input: UpdateServiceInput): Promise<Service> {
    const businessId = input.businessId.trim();
    const serviceId = input.serviceId.trim();
    if (!businessId || !serviceId) throw new InvalidServiceError('El servicio requiere un identificador válido.');
    return this.services.update(businessId, serviceId, ServiceDraft.create(input));
  }
}
