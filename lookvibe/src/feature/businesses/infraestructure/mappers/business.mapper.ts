import type { BusinessFilters } from '../../application/repositories/business-repository';
import { Business } from '../../domain/entities/business';
import type { BusinessDraft } from '../../domain/value-objects/business-draft';
import type { BusinessSchedule } from '../../domain/value-objects/business-schedule';
import type { BusinessDto } from '../dtos/business.dto';
import type { BusinessRequestDto, ScheduleRequestDto } from '../dtos/business-requests.dto';

export function businessToDomain(dto: BusinessDto): Business {
  return Business.create({
    id: dto.id,
    name: dto.nombre,
    description: dto.descripcion,
    address: dto.direccion,
    latitude: dto.latitud,
    longitude: dto.longitud,
    status: dto.estado,
    services: (dto.servicios ?? []).map((service) => ({
      id: service.id,
      name: service.nombre,
      price: service.precio,
      durationMinutes: service.duracionMin,
    })),
    stylistCount: dto.estilistas?.length ?? 0,
  });
}

export function filtersToQuery(filters: BusinessFilters): string {
  const params = new URLSearchParams();
  if (filters.service) params.set('servicio', filters.service);
  if (filters.near) {
    params.set('cerca_de', `${filters.near.location.latitude},${filters.near.location.longitude}`);
    params.set('radioKm', String(filters.near.radius.kilometers));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function draftToDto(draft: BusinessDraft): BusinessRequestDto {
  return {
    nombre: draft.name,
    ...(draft.description ? { descripcion: draft.description } : {}),
    ...(draft.address ? { direccion: draft.address } : {}),
    ...(draft.location ? { latitud: draft.location.latitude, longitud: draft.location.longitude } : {}),
  };
}

export function scheduleToDto(schedule: BusinessSchedule): ScheduleRequestDto {
  return {
    horarios: schedule.intervals.map((interval) => ({
      diaSemana: interval.dayOfWeek,
      horaInicio: interval.startTime,
      horaFin: interval.endTime,
    })),
    zonaHoraria: schedule.timeZone,
  };
}
