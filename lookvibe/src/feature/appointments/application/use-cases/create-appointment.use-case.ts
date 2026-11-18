import type { Appointment } from '../../domain/entities/appointment';
import { InvalidAppointmentError } from '../../domain/errors/invalid-appointment-error';
import { AppointmentDateTime } from '../../domain/value-objects/appointment-date-time';
import { AppointmentTarget } from '../../domain/value-objects/appointment-target';
import type { AppointmentRepository } from '../repositories/appointment-repository';

export interface CreateAppointmentInput {
  readonly userId: string;
  readonly serviceId: string;
  readonly businessId?: string;
  readonly stylistId?: string;
  readonly startsAt: string | Date;
  readonly note?: string;
}

export class CreateAppointmentUseCase {
  constructor(private readonly appointments: AppointmentRepository) {}

  execute(input: CreateAppointmentInput): Promise<Appointment> {
    const userId = requireId(input.userId, 'El usuario');
    const serviceId = requireId(input.serviceId, 'El servicio');
    const note = validateNote(input.note);

    return this.appointments.create({
      userId,
      serviceId,
      target: AppointmentTarget.create({
        businessId: input.businessId,
        stylistId: input.stylistId,
      }),
      startsAt: AppointmentDateTime.create(input.startsAt),
      ...(note === undefined ? {} : { note }),
    });
  }
}

function requireId(id: string, label: string): string {
  const value = id.trim();
  if (!value) throw new InvalidAppointmentError(`${label} requiere un identificador válido.`);
  return value;
}

function validateNote(note: string | undefined): string | undefined {
  if (note === undefined) return undefined;
  if (note.length > 500) throw new InvalidAppointmentError('La nota no puede superar 500 caracteres.');
  return note;
}
