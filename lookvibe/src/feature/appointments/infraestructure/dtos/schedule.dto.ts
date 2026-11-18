export interface ScheduleIntervalDto {
  diaSemana: number;
  horaInicio: string;
  horaFin: string;
}

export interface SetScheduleRequestDto {
  zonaHoraria?: string;
  horarios: ScheduleIntervalDto[];
}

export interface SetScheduleResponseDto extends SetScheduleRequestDto {
  tipoRecurso: 'negocio' | 'estilista';
  recursoId: string;
}
