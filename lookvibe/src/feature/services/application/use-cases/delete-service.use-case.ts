import { InvalidServiceError } from '../../domain/errors/invalid-service-error';
import type { ServiceRepository } from '../repositories/service-repository';

export interface DeleteServiceInput {
  readonly businessId: string;
  readonly serviceId: string;
}

export class DeleteServiceUseCase {
  constructor(private readonly services: ServiceRepository) {}

  async execute(input: DeleteServiceInput): Promise<void> {
    const businessId = input.businessId.trim();
    const serviceId = input.serviceId.trim();
    if (!businessId || !serviceId) throw new InvalidServiceError('El servicio requiere un identificador válido.');
    await this.services.delete(businessId, serviceId);
  }
}
