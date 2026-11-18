export interface BusinessRequestDto {
  nombre: string;
  descripcion?: string;
  direccion?: string;
  latitud?: number;
  longitud?: number;
}

export interface ScheduleIntervalRequestDto {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

export interface ScheduleRequestDto {
  horarios: ScheduleIntervalRequestDto[];
  zonaHoraria: string;
}
