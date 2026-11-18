import { InvalidReportError } from '../errors/invalid-report-error';
import type { UsageMonthMetric } from './report-metrics';

export interface UsageReportData {
  generatedAt: string;
  users: number;
  businesses: number;
  activeBusinesses: number;
  appointments: number;
  reviews: number;
  appointmentsByMonth: UsageMonthMetric[];
}

export class UsageReport {
  readonly generatedAt: string;
  readonly users: number;
  readonly businesses: number;
  readonly activeBusinesses: number;
  readonly appointments: number;
  readonly reviews: number;
  readonly appointmentsByMonth: UsageMonthMetric[];

  constructor(data: UsageReportData) {
    if (Number.isNaN(Date.parse(data.generatedAt))) {
      throw new InvalidReportError('La fecha de generación del reporte no es válida.');
    }
    for (const [label, value] of Object.entries({
      users: data.users,
      businesses: data.businesses,
      activeBusinesses: data.activeBusinesses,
      appointments: data.appointments,
      reviews: data.reviews,
    })) {
      if (!Number.isFinite(value) || value < 0) {
        throw new InvalidReportError(`El indicador ${label} debe ser mayor o igual a cero.`);
      }
    }
    if (data.activeBusinesses > data.businesses) {
      throw new InvalidReportError('Los negocios activos no pueden superar el total de negocios.');
    }
    for (const point of data.appointmentsByMonth) {
      if (!/^\d{4}-\d{2}$/.test(point.period) || !Number.isFinite(point.appointments) || point.appointments < 0) {
        throw new InvalidReportError('La serie mensual de citas contiene datos inválidos.');
      }
    }
    this.generatedAt = data.generatedAt;
    this.users = data.users;
    this.businesses = data.businesses;
    this.activeBusinesses = data.activeBusinesses;
    this.appointments = data.appointments;
    this.reviews = data.reviews;
    this.appointmentsByMonth = data.appointmentsByMonth;
  }
}