import { InvalidServiceError } from '../errors/invalid-service-error';
import { ServiceDuration } from '../value-objects/service-duration';
import { ServicePrice } from '../value-objects/service-price';

export interface ServiceInput {
  id: string;
  businessId: string;
  name: string;
  price: number | string;
  durationMinutes: number;
}

export class Service {
  private constructor(
    readonly id: string,
    readonly businessId: string,
    readonly name: string,
    readonly price: ServicePrice,
    readonly duration: ServiceDuration,
  ) {}

  static create(input: ServiceInput): Service {
    const id = input.id.trim();
    const businessId = input.businessId.trim();
    if (!id || !businessId) throw new InvalidServiceError('El servicio no tiene un identificador válido.');

    const name = input.name.trim();
    if (!name) throw new InvalidServiceError('El servicio debe tener un nombre.');

    return new Service(
      id,
      businessId,
      name,
      ServicePrice.create(input.price),
      ServiceDuration.create(input.durationMinutes),
    );
  }
}
