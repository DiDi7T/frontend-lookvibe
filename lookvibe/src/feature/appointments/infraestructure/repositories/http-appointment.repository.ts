import type { AppointmentRepository, NewAppointment, RescheduleAppointment } from '../../application/repositories/appointment-repository';
import type { Appointment } from '../../domain/entities/appointment';
import { HttpError, type HttpClient } from '../../../../shared/infrastructure/http-client';
import type { AppointmentDto } from '../dtos/appointment.dto';
import type { CompleteAppointmentRequestDto } from '../dtos/appointment-requests.dto';
import { appointmentToDomain, newAppointmentToDto, rescheduleToDto } from '../mappers/appointment.mapper';

export class HttpAppointmentRepository implements AppointmentRepository {
  constructor(private readonly http: HttpClient) {}

  async findAll(): Promise<Appointment[]> {
    let appointments: AppointmentDto[];
    try {
      appointments = await this.http.get<AppointmentDto[]>('/appointments');
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 404) throw error;
      appointments = await this.http.get<AppointmentDto[]>('/citas');
    }
    return appointments.map(appointmentToDomain);
  }

  async findById(id: string): Promise<Appointment | null> {
    try {
      const appointment = await this.http.get<AppointmentDto>(`/appointments/${encodeURIComponent(id)}`);
      return appointmentToDomain(appointment);
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) return null;
      throw error;
    }
  }

  async create(input: NewAppointment): Promise<Appointment> {
    const appointment = await this.http.post<AppointmentDto>('/appointments', newAppointmentToDto(input));
    return appointmentToDomain(appointment);
  }

  async reschedule(id: string, changes: RescheduleAppointment): Promise<Appointment> {
    const appointment = await this.http.put<AppointmentDto>(
      `/appointments/${encodeURIComponent(id)}`,
      rescheduleToDto(changes),
    );
    return appointmentToDomain(appointment);
  }

  async cancel(id: string, reason?: string): Promise<void> {
    const query = reason === undefined ? '' : `?${new URLSearchParams({ motivo: reason })}`;
    await this.http.delete(`/appointments/${encodeURIComponent(id)}${query}`);
  }

  async setCompletion(id: string, completed: boolean): Promise<Appointment> {
    const body: CompleteAppointmentRequestDto = { completada: completed };
    const appointment = await this.http.patch<AppointmentDto>(
      `/appointments/${encodeURIComponent(id)}/completada`,
      body,
    );
    return appointmentToDomain(appointment);
  }
}
