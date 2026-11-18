import { InvalidAppointmentError } from '../errors/invalid-appointment-error';

export class AppointmentDuration {
  private constructor(readonly minutes: number) {}

  static create(minutes: number): AppointmentDuration {
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 1440) {
      throw new InvalidAppointmentError(
        'La duración de la cita debe ser un entero entre 1 y 1440 minutos.',
      );
    }

    return new AppointmentDuration(minutes);
  }
}
