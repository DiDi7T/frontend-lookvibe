import type {
  AppointmentAvailabilityRepository,
  AvailabilitySearch,
} from '../../application/repositories/appointment-availability-repository';
import type { AppointmentSlot } from '../../domain/entities/appointment-slot';
import type { HttpClient } from '../../../../shared/infrastructure/http-client';
import type {
  AvailabilityQueryDto,
  BusinessAvailabilityDto,
  StylistAvailabilityDto,
} from '../dtos/availability.dto';
import { appointmentSlotToDomain } from '../mappers/appointment-slot.mapper';

export class HttpAppointmentAvailabilityRepository implements AppointmentAvailabilityRepository {
  constructor(private readonly http: HttpClient) {}

  async forBusiness(id: string, search: AvailabilitySearch = {}): Promise<AppointmentSlot[]> {
    const response = await this.http.get<BusinessAvailabilityDto>(
      `/appointments/negocios/${encodeURIComponent(id)}/disponibilidad${toQuery(search)}`,
    );
    return response.slots.map((slot) => appointmentSlotToDomain(slot, response.zonaHoraria));
  }

  async forStylist(id: string, search: AvailabilitySearch = {}): Promise<AppointmentSlot[]> {
    const response = await this.http.get<StylistAvailabilityDto>(
      `/appointments/estilistas/${encodeURIComponent(id)}/disponibilidad${toQuery(search)}`,
    );
    return response.slots.map((slot) => appointmentSlotToDomain(slot, response.zonaHoraria));
  }
}

function toQuery(search: AvailabilitySearch): string {
  const query: AvailabilityQueryDto = {
    ...(search.date === undefined ? {} : { fecha: search.date }),
    ...(search.duration === undefined ? {} : { duracionMin: search.duration.minutes }),
    ...(search.step === undefined ? {} : { pasoMin: search.step.minutes }),
  };
  const params = new URLSearchParams();
  if (query.fecha !== undefined) params.set('fecha', query.fecha);
  if (query.duracionMin !== undefined) params.set('duracionMin', String(query.duracionMin));
  if (query.pasoMin !== undefined) params.set('pasoMin', String(query.pasoMin));
  const value = params.toString();
  return value ? `?${value}` : '';
}
