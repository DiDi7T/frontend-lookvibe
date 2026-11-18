export interface BookingReviewDto {
  id: string;
  usuario?: { nombre?: string };
  calificacion: number;
  comentario: string;
  reportado?: boolean;
  createdAt: string;
}
