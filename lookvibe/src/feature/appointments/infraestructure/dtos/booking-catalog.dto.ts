export interface BookingBusinessDto {
  id: string;
  nombre: string;
  descripcion?: string | null;
  direccion?: string | null;
  servicios?: BookingServiceDto[];
  estilistas?: BookingStylistDto[];
}

export interface BookingBusinessScheduleDto {
  businessId: string;
  zonaHoraria: string;
  horarios: Array<{
    diaSemana: number;
    horaInicio: string;
    horaFin: string;
  }>;
}

export interface BookingServiceDto {
  id: string;
  nombre: string;
  precio: number | string;
  duracionMin: number;
}

export interface BookingStylistDto {
  id: string;
  especialidad: string;
  estadoAfiliacion?: string;
  fotoUrl?: string | null;
  usuario?: { nombre?: string | null } | null;
}
