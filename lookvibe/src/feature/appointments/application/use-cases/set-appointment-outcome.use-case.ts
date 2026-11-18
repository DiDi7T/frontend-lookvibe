import type { Appointment } from '../../domain/entities/appointment';
import type { AppointmentRepository } from '../repositories/appointment-repository';
import { InvalidAppointmentError } from '../../domain/errors/invalid-appointment-error';

export interface SetAppointmentOutcomeInput {
  readonly id: string;
  readonly completed: boolean;
}

export class SetAppointmentOutcomeUseCase {
  constructor(private readonly appointments: AppointmentRepository) {}

  execute(input: SetAppointmentOutcomeInput): Promise<Appointment> {
    const id = input.id.trim();
    if (!id) throw new InvalidAppointmentError('La cita requiere un identificador válido.');
    if (typeof input.completed !== 'boolean') {
      throw new InvalidAppointmentError('El resultado de la cita no es válido.');
    }
    return this.appointments.setCompletion(id, input.completed);
  }
}
