export interface ReviewDto {
  id: string;
  calificacion: number;
  comentario: string;
  reportado: boolean;
  createdAt: string;
  usuario?: { nombre?: string | null } | null;
}

export interface CreateReviewRequestDto {
  citaId: string;
  calificacion: number;
  comentario: string;
}

export interface ExploreResponseDto {
  negocios?: { id: string; nombre?: string | null }[];
  estilistas?: { id: string; especialidad?: string | null; usuario?: { nombre?: string | null } | null }[];
}
