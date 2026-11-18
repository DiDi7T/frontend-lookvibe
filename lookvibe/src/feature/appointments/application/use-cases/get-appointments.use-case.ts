import type { Appointment } from '../../domain/entities/appointment';
import type { AppointmentRepository } from '../repositories/appointment-repository';

export class GetAppointmentsUseCase {
  constructor(private readonly appointments: AppointmentRepository) {}

  execute(): Promise<Appointment[]> {
    return this.appointments.findAll();
  }
}
