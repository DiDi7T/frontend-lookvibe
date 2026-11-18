export interface BusinessServiceDto {
  id: string;
  nombre: string;
  precio: number | string;
  duracionMin: number;
}

export interface BusinessDto {
  id: string;
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  latitud: number | null;
  longitud: number | null;
  estado: string;
  servicios?: BusinessServiceDto[];
  estilistas?: { id: string }[];
}
