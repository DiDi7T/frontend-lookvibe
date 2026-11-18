import { AppointmentSlot } from '../../domain/entities/appointment-slot';
import type { AvailabilitySlotDto } from '../dtos/availability.dto';

export function appointmentSlotToDomain(dto: AvailabilitySlotDto, timeZone = 'America/Bogota'): AppointmentSlot {
  return AppointmentSlot.create({
    startsAt: dto.inicio,
    endsAt: dto.fin,
    available: dto.disponible,
    timeZone,
  });
}
