import type {
  AppointmentBusinessSummaryDto,
  AppointmentServiceDto,
  AppointmentStylistSummaryDto,
} from './appointment-relations.dto';

export type AppointmentStatusDto =
  | 'pendiente'
  | 'completada'
  | 'cancelada'
  | 'no_realizada';

export interface AppointmentUserDto {
  id: string;
  nombre: string;
  email: string;
  roles: string[];
}

export interface AppointmentDto {
  id: string;
  usuario: AppointmentUserDto;
  negocio: AppointmentBusinessSummaryDto | null;
  estilista: AppointmentStylistSummaryDto | null;
  servicio: AppointmentServiceDto;
  fechaHora: string;
  duracionMin: number;
  precioBase: number | string | null;
  descuentoBienvenida: number | string;
  beneficioBienvenidaAplicado: boolean;
  precioTotal: number | string | null;
  estado: AppointmentStatusDto;
  nota: string | null;
  createdAt: string;
  updatedAt: string;
}
