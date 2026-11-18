import { InvalidServiceError } from '../errors/invalid-service-error';
import { ServiceDuration } from './service-duration';
import { ServicePrice } from './service-price';

export interface ServiceDraftInput {
  name: string;
  price: number | string;
  durationMinutes: number;
}

export class ServiceDraft {
  private constructor(
    readonly name: string,
    readonly price: ServicePrice,
    readonly duration: ServiceDuration,
  ) {}

  static create(input: ServiceDraftInput): ServiceDraft {
    const name = input.name.trim();
    if (!name) throw new InvalidServiceError('El nombre del servicio es obligatorio.');
    if (name.length > 120) throw new InvalidServiceError('El nombre no puede superar 120 caracteres.');
    return new ServiceDraft(name, ServicePrice.create(input.price), ServiceDuration.create(input.durationMinutes));
  }
}
