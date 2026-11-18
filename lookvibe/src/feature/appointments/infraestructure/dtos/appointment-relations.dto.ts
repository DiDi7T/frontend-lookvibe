
export interface AppointmentBusinessSummaryDto {
  id: string;
  nombre: string;
  direccion: string | null;
}

export interface AppointmentServiceDto {
  id: string;
  nombre: string;
  precio: number | string;
  duracionMin: number;
}

export type AppointmentStylistAffiliationDto =
  | 'INDEPENDIENTE'
  | 'PENDIENTE'
  | 'AFILIADO';

export interface AppointmentStylistSummaryDto {
  id: string;
  fotoUrl: string | null;
  especialidad: string;
  estadoAfiliacion: AppointmentStylistAffiliationDto;
  negocio?: AppointmentBusinessSummaryDto | null;
}
