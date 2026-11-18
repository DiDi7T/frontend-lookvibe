import { InvalidServiceError } from '../errors/invalid-service-error';

export class ServicePrice {
  private constructor(readonly amount: number) {}

  static create(value: number | string): ServicePrice {
    const amount = typeof value === 'number' ? value : Number(value);
    if (typeof value === 'string' && value.trim() === '') {
      throw new InvalidServiceError('El precio es obligatorio.');
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new InvalidServiceError('El precio debe ser mayor a cero.');
    }
    if (Math.abs(Math.round(amount * 100) - amount * 100) > 1e-6) {
      throw new InvalidServiceError('El precio admite máximo dos decimales.');
    }
    return new ServicePrice(amount);
  }
}
