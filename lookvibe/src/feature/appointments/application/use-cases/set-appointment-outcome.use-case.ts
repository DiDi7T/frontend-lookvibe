import type { Appointment } from '../../domain/entities/appointment';
import type { AppointmentRepository } from '../repositories/appointment-repository';
import { InvalidAppointmentError } from '../../domain/errors/invalid-appointment-error';

export interface SetAppointmentOutcomeInput {
  readonly id: string;
  readonly completed: boolean;
  readonly startsAt: Date;
}

export class SetAppointmentOutcomeUseCase {
  constructor(
    private readonly appointments: AppointmentRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  execute(input: SetAppointmentOutcomeInput): Promise<Appointment> {
    const id = input.id.trim();
    if (!id) throw new InvalidAppointmentError('La cita requiere un identificador válido.');
    if (typeof input.completed !== 'boolean') {
      throw new InvalidAppointmentError('El resultado de la cita no es válido.');
    }
    if (!(input.startsAt instanceof Date) || Number.isNaN(input.startsAt.getTime())) {
      throw new InvalidAppointmentError('La fecha de la cita no es válida.');
    }
    if (input.startsAt.getTime() > this.now().getTime()) {
      throw new InvalidAppointmentError('Solo puedes registrar el resultado cuando ya hayan llegado la fecha y la hora de la cita.');
    }
    return this.appointments.setCompletion(id, input.completed);
  }
}
