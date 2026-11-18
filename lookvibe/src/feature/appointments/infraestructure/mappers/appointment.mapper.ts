import type { Appointment } from '../../domain/entities/appointment';
import { Appointment as AppointmentEntity } from '../../domain/entities/appointment';
import type {
  NewAppointment,
  RescheduleAppointment,
} from '../../application/repositories/appointment-repository';
import type { AppointmentDto } from '../dtos/appointment.dto';
import type {
  CreateAppointmentRequestDto,
  UpdateAppointmentRequestDto,
} from '../dtos/appointment-requests.dto';

export function appointmentToDomain(dto: AppointmentDto): Appointment {
  return AppointmentEntity.create({
    id: dto.id,
    userId: dto.usuario.id,
    clientName: dto.usuario.nombre,
    serviceId: dto.servicio.id,
    businessId: dto.negocio?.id ?? null,
    stylistId: dto.estilista?.id ?? null,
    startsAt: dto.fechaHora,
    durationMinutes: dto.duracionMin,
    price: {
      base: dto.precioBase,
      welcomeDiscount: dto.descuentoBienvenida,
      total: dto.precioTotal,
    },
    status: dto.estado,
    note: dto.nota,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    businessSummary: dto.negocio ? {
      id: dto.negocio.id,
      name: dto.negocio.nombre,
      address: dto.negocio.direccion,
    } : null,
    serviceSummary: {
      id: dto.servicio.id,
      name: dto.servicio.nombre,
      price: Number(dto.servicio.precio),
      durationMinutes: dto.servicio.duracionMin,
    },
    stylistSummary: dto.estilista ? {
      id: dto.estilista.id,
      photoUrl: dto.estilista.fotoUrl,
      specialty: dto.estilista.especialidad,
      affiliationStatus: dto.estilista.estadoAfiliacion,
    } : null,
    welcomeBenefitApplied: dto.beneficioBienvenidaAplicado,
  });
}

export function newAppointmentToDto(input: NewAppointment): CreateAppointmentRequestDto {
  return {
    usuarioId: input.userId,
    servicioId: input.serviceId,
    ...(input.target.businessId ? { negocioId: input.target.businessId } : {}),
    ...(input.target.stylistId ? { estilistaId: input.target.stylistId } : {}),
    fechaHora: input.startsAt.isoValue,
    ...(input.note === undefined ? {} : { nota: input.note }),
  };
}

export function rescheduleToDto(input: RescheduleAppointment): UpdateAppointmentRequestDto {
  return {
    ...(input.target?.businessId ? { negocioId: input.target.businessId } : {}),
    ...(input.target?.stylistId ? { estilistaId: input.target.stylistId } : {}),
    ...(input.serviceId === undefined ? {} : { servicioId: input.serviceId }),
    ...(input.startsAt === undefined ? {} : { fechaHora: input.startsAt.isoValue }),
    ...(input.note === undefined ? {} : { nota: input.note }),
  };
}
