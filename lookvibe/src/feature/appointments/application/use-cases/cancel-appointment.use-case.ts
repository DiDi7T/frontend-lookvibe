import type { AppointmentRepository } from '../repositories/appointment-repository';
import { InvalidAppointmentError } from '../../domain/errors/invalid-appointment-error';

export interface CancelAppointmentInput {
  readonly id: string;
  readonly reason?: string;
}

export class CancelAppointmentUseCase {
  constructor(private readonly appointments: AppointmentRepository) {}

  execute(input: CancelAppointmentInput): Promise<void> {
    const id = input.id.trim();
    if (!id) throw new InvalidAppointmentError('La cita requiere un identificador válido.');
    if (input.reason !== undefined && input.reason.length > 500) {
      throw new InvalidAppointmentError('El motivo no puede superar 500 caracteres.');
    }
    return this.appointments.cancel(id, input.reason);
  }
}
