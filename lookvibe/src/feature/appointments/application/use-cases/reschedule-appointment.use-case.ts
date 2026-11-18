import type { Appointment } from '../../domain/entities/appointment';
import { InvalidAppointmentError } from '../../domain/errors/invalid-appointment-error';
import { AppointmentDateTime } from '../../domain/value-objects/appointment-date-time';
import { AppointmentTarget } from '../../domain/value-objects/appointment-target';
import type {
  AppointmentRepository,
  RescheduleAppointment,
} from '../repositories/appointment-repository';

export interface RescheduleAppointmentInput {
  readonly id: string;
  readonly businessId?: string;
  readonly stylistId?: string;
  readonly serviceId?: string;
  readonly startsAt?: string | Date;
  readonly note?: string | null;
}

export class RescheduleAppointmentUseCase {
  constructor(private readonly appointments: AppointmentRepository) {}

  execute(input: RescheduleAppointmentInput): Promise<Appointment> {
    const id = requireId(input.id, 'La cita');
    const changes: RescheduleAppointment = {
      ...(input.businessId !== undefined || input.stylistId !== undefined
        ? {
            target: AppointmentTarget.create({
              businessId: input.businessId,
              stylistId: input.stylistId,
            }),
          }
        : {}),
      ...(input.serviceId === undefined
        ? {}
        : { serviceId: requireId(input.serviceId, 'El servicio') }),
      ...(input.startsAt === undefined
        ? {}
        : { startsAt: AppointmentDateTime.create(input.startsAt) }),
      ...(input.note === undefined ? {} : { note: validateNote(input.note) }),
    };

    if (Object.keys(changes).length === 0) {
      throw new InvalidAppointmentError('Indica al menos un cambio para actualizar la cita.');
    }

    return this.appointments.reschedule(id, changes);
  }
}

function requireId(id: string, label: string): string {
  const value = id.trim();
  if (!value) throw new InvalidAppointmentError(`${label} requiere un identificador válido.`);
  return value;
}

function validateNote(note: string | null): string | null {
  if (note !== null && note.length > 500) {
    throw new InvalidAppointmentError('La nota no puede superar 500 caracteres.');
  }
  return note;
}
