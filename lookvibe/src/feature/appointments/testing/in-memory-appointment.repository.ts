import type {
  AppointmentRepository,
  NewAppointment,
  RescheduleAppointment,
} from '../application/repositories/appointment-repository';
import type { Appointment } from '../domain/entities/appointment';
import { Appointment as AppointmentEntity, type AppointmentInput } from '../domain/entities/appointment';

export function anAppointment(overrides: Partial<AppointmentInput> = {}): Appointment {
  return AppointmentEntity.create({
    id: 'appointment-1',
    userId: 'client-1',
    clientName: 'Ana Cliente',
    serviceId: 'service-1',
    businessId: 'business-1',
    stylistId: null,
    startsAt: '2026-05-20T15:00:00.000Z',
    durationMinutes: 45,
    price: { base: 45000, welcomeDiscount: 0, total: 45000 },
    status: 'pendiente',
    note: null,
    createdAt: '2026-05-01T12:00:00.000Z',
    updatedAt: '2026-05-01T12:00:00.000Z',
    ...overrides,
  });
}

export class InMemoryAppointmentRepository implements AppointmentRepository {
  readonly created: NewAppointment[] = [];
  readonly rescheduled: Array<{ id: string; changes: RescheduleAppointment }> = [];
  readonly cancelled: Array<{ id: string; reason?: string }> = [];
  readonly completions: Array<{ id: string; completed: boolean }> = [];

  constructor(private readonly appointments: Appointment[] = []) {}

  async findAll(): Promise<Appointment[]> {
    return this.appointments;
  }

  async findById(id: string): Promise<Appointment | null> {
    return this.appointments.find((appointment) => appointment.id === id) ?? null;
  }

  async create(input: NewAppointment): Promise<Appointment> {
    this.created.push(input);
    return anAppointment({
      id: `appointment-${this.created.length}`,
      userId: input.userId,
      serviceId: input.serviceId,
      businessId: input.target.businessId,
      stylistId: input.target.stylistId,
      startsAt: input.startsAt.toDate(),
      note: input.note ?? null,
    });
  }

  async reschedule(id: string, changes: RescheduleAppointment): Promise<Appointment> {
    this.rescheduled.push({ id, changes });
    return this.appointments.find((appointment) => appointment.id === id) ?? anAppointment({ id });
  }

  async cancel(id: string, reason?: string): Promise<void> {
    this.cancelled.push({ id, ...(reason === undefined ? {} : { reason }) });
  }

  async setCompletion(id: string, completed: boolean): Promise<Appointment> {
    this.completions.push({ id, completed });
    return this.appointments.find((appointment) => appointment.id === id) ?? anAppointment({ id });
  }
}
