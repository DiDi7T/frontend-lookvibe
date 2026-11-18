import { Service } from '../../domain/entities/service';
import type { ServiceDraft } from '../../domain/value-objects/service-draft';
import type { ServiceDto, ServiceRequestDto } from '../dtos/service.dto';

export function serviceToDomain(dto: ServiceDto, businessId: string): Service {
  return Service.create({
    id: dto.id,
    businessId,
    name: dto.nombre,
    price: dto.precio,
    durationMinutes: dto.duracionMin,
  });
}

export function serviceDraftToDto(draft: ServiceDraft): ServiceRequestDto {
  return {
    nombre: draft.name,
    precio: draft.price.amount,
    duracionMin: draft.duration.minutes,
  };
}
