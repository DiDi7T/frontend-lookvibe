import { InvalidAppointmentError } from '../errors/invalid-appointment-error';

export const APPOINTMENT_STATUSES = [
  'pendiente',
  'completada',
  'cancelada',
  'no_realizada',
] as const;

export type AppointmentStatusValue = (typeof APPOINTMENT_STATUSES)[number];

export class AppointmentStatus {
  private constructor(readonly value: AppointmentStatusValue) {}

  static create(value: string): AppointmentStatus {
    const status = APPOINTMENT_STATUSES.find((candidate) => candidate === value);
    if (!status) {
      throw new InvalidAppointmentError('El estado de la cita no es válido.');
    }

    return new AppointmentStatus(status);
  }
}
