import { InvalidAppointmentError } from '../errors/invalid-appointment-error';

export class AppointmentDateTime {
  private constructor(readonly isoValue: string) {}

  static create(value: string | Date): AppointmentDateTime {
    const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);

    if (!Number.isFinite(date.getTime())) {
      throw new InvalidAppointmentError('La fecha y hora de la cita no es válida.');
    }

    return new AppointmentDateTime(date.toISOString());
  }

  toDate(): Date {
    return new Date(this.isoValue);
  }
}
