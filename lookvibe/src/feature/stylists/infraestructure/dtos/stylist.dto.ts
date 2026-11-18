export interface StylistDto {
  id: string;
  especialidad: string;
  fotoUrl: string | null;
  estadoAfiliacion: string;
  usuario?: { id?: string; nombre?: string | null } | null;
  negocio?: { id: string; nombre: string; owner?: { id: string } | null } | null;
  negocioSolicitado?: { id: string; nombre: string } | null;
}

export interface StylistRequestDto {
  especialidad: string;
  fotoUrl?: string;
}
