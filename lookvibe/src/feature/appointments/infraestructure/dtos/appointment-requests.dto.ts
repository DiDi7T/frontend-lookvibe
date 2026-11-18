export interface CreateAppointmentRequestDto {
  usuarioId: string;
  negocioId?: string;
  estilistaId?: string;
  servicioId: string;
  fechaHora: string;
  nota?: string;
}

export interface UpdateAppointmentRequestDto {
  usuarioId?: string;
  negocioId?: string;
  estilistaId?: string;
  servicioId?: string;
  fechaHora?: string;
  nota?: string | null;
  motivoCancelacion?: string;
}

export interface CompleteAppointmentRequestDto {
  completada?: boolean;
}

export interface CancelAppointmentResponseDto {
  message: string;
  id: string;
}
