import { Stylist } from '../../domain/entities/stylist';
import type { StylistDraft } from '../../domain/value-objects/stylist-draft';
import type { StylistDto, StylistRequestDto } from '../dtos/stylist.dto';

export function stylistToDomain(dto: StylistDto): Stylist {
  return Stylist.create({
    id: dto.id,
    name: dto.usuario?.nombre ?? null,
    specialty: dto.especialidad,
    photoUrl: dto.fotoUrl,
    affiliation: dto.estadoAfiliacion,
    business: dto.negocio
      ? { id: dto.negocio.id, name: dto.negocio.nombre, ownerId: dto.negocio.owner?.id ?? null }
      : null,
    requestedBusiness: dto.negocioSolicitado
      ? { id: dto.negocioSolicitado.id, name: dto.negocioSolicitado.nombre }
      : null,
    accountId: dto.usuario?.id ?? null,
  });
}

export function stylistDraftToDto(draft: StylistDraft): StylistRequestDto {
  return {
    especialidad: draft.specialty,
    ...(draft.photoUrl ? { fotoUrl: draft.photoUrl } : {}),
  };
}
