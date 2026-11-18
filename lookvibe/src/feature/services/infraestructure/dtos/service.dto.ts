export interface ServiceDto {
  id: string;
  nombre: string;
  precio: number | string;
  duracionMin: number;
}

export interface ServiceRequestDto {
  nombre: string;
  precio: number;
  duracionMin: number;
}
