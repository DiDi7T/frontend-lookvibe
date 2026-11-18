import { InvalidAppointmentError } from '../errors/invalid-appointment-error';
import { AppointmentDateTime } from '../value-objects/appointment-date-time';

export class AppointmentSlot {
  private constructor(
    readonly startsAt: AppointmentDateTime,
    readonly endsAt: AppointmentDateTime,
    readonly available: boolean,
    readonly timeZone: string,
  ) {}

  static create(input: {
    startsAt: string | Date;
    endsAt: string | Date;
    available: boolean;
    timeZone?: string;
  }): AppointmentSlot {
    if (typeof input.available !== 'boolean') {
      throw new InvalidAppointmentError('La disponibilidad del espacio no es válida.');
    }
    const startsAt = AppointmentDateTime.create(input.startsAt);
    const endsAt = AppointmentDateTime.create(input.endsAt);

    if (endsAt.toDate().getTime() <= startsAt.toDate().getTime()) {
      throw new InvalidAppointmentError(
        'El final del espacio disponible debe ser posterior al inicio.',
      );
    }

    return new AppointmentSlot(startsAt, endsAt, input.available, input.timeZone ?? 'America/Bogota');
  }
}
