import { InvalidServiceError } from '../errors/invalid-service-error';

const MAX_MINUTES = 480;

export class ServiceDuration {
  private constructor(readonly minutes: number) {}

  static create(minutes: number): ServiceDuration {
    if (!Number.isInteger(minutes) || minutes < 1) {
      throw new InvalidServiceError('La duración debe ser un número entero de minutos mayor a cero.');
    }
    if (minutes > MAX_MINUTES) {
      throw new InvalidServiceError('La duración no puede superar 8 horas.');
    }
    return new ServiceDuration(minutes);
  }
}
