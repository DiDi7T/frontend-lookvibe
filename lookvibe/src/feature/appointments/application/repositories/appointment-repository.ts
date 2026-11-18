import type { Appointment } from '../../domain/entities/appointment';
import type { AppointmentDateTime } from '../../domain/value-objects/appointment-date-time';
import type { AppointmentTarget } from '../../domain/value-objects/appointment-target';

export interface NewAppointment {
  readonly userId: string;
  readonly serviceId: string;
  readonly target: AppointmentTarget;
  readonly startsAt: AppointmentDateTime;
  readonly note?: string;
}

export interface RescheduleAppointment {
  readonly target?: AppointmentTarget;
  readonly serviceId?: string;
  readonly startsAt?: AppointmentDateTime;
  readonly note?: string | null;
}


export interface AppointmentRepository {
  findAll(): Promise<Appointment[]>;
  findById(id: string): Promise<Appointment | null>;
  create(input: NewAppointment): Promise<Appointment>;
  reschedule(id: string, changes: RescheduleAppointment): Promise<Appointment>;
  cancel(id: string, reason?: string): Promise<void>;
  setCompletion(id: string, completed: boolean): Promise<Appointment>;
}
