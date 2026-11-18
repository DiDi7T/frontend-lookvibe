export interface AvailabilityQueryDto {
  fecha?: string;
  duracionMin?: number;
  pasoMin?: number;
}

export interface AvailabilitySlotDto {
  inicio: string;
  fin: string;
  disponible: boolean;
}

interface AvailabilityResponseDto {
  fecha: string;
  zonaHoraria: string;
  ocupadas: number;
  slots: AvailabilitySlotDto[];
}

export interface BusinessAvailabilityDto extends AvailabilityResponseDto {
  businessId: string;
}

export interface StylistAvailabilityDto extends AvailabilityResponseDto {
  stylistId: string;
}
