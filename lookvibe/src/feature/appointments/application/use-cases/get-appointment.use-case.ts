import type { Appointment } from '../../domain/entities/appointment';
import { InvalidAppointmentError } from '../../domain/errors/invalid-appointment-error';
import type { AppointmentRepository } from '../repositories/appointment-repository';

export class GetAppointmentUseCase {
  constructor(private readonly appointments: AppointmentRepository) {}

  async execute(id: string): Promise<Appointment> {
    const appointmentId = requireId(id, 'La cita');
    const appointment = await this.appointments.findById(appointmentId);
    if (!appointment) throw new InvalidAppointmentError('No se encontró la cita solicitada.');
    return appointment;
  }
}

function requireId(id: string, label: string): string {
  const value = id.trim();
  if (!value) throw new InvalidAppointmentError(`${label} requiere un identificador válido.`);
  return value;
}
