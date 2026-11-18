import { InvalidReportError } from '../errors/invalid-report-error';
import { ReportPeriod } from '../value-objects/report-period';
import type { AppointmentReportMetrics } from './report-metrics';

export interface BusinessReportData {
  business: { id: string; name: string };
  period: ReportPeriod;
  timezone: string;
  appointments: AppointmentReportMetrics;
  mostRequestedService: { id: string; name: string; count: number } | null;
  estimatedRevenue: number;
  averageRating: number | null;
  reviewCount: number;
}

export class BusinessReport {
  readonly business: BusinessReportData['business'];
  readonly period: ReportPeriod;
  readonly timezone: string;
  readonly appointments: AppointmentReportMetrics;
  readonly mostRequestedService: BusinessReportData['mostRequestedService'];
  readonly estimatedRevenue: number;
  readonly averageRating: number | null;
  readonly reviewCount: number;

  constructor(data: BusinessReportData) {
    if (!data.business.id.trim() || !data.business.name.trim() || !data.timezone.trim()) {
      throw new InvalidReportError('El reporte debe identificar un negocio y su zona horaria.');
    }
    validateCount(data.estimatedRevenue, 'Los ingresos estimados');
    validateCount(data.reviewCount, 'La cantidad de reseñas');
    if (data.averageRating !== null && (!Number.isFinite(data.averageRating) || data.averageRating < 0 || data.averageRating > 5)) {
      throw new InvalidReportError('La calificación promedio debe estar entre 0 y 5.');
    }
    validateAppointmentMetrics(data.appointments);
    if (data.mostRequestedService) {
      if (!data.mostRequestedService.id.trim() || !data.mostRequestedService.name.trim()) {
        throw new InvalidReportError('El servicio más solicitado debe tener nombre e identificador.');
      }
      validateCount(data.mostRequestedService.count, 'La cantidad de solicitudes');
    }
    this.business = data.business;
    this.period = data.period;
    this.timezone = data.timezone;
    this.appointments = data.appointments;
    this.mostRequestedService = data.mostRequestedService;
    this.estimatedRevenue = data.estimatedRevenue;
    this.averageRating = data.averageRating;
    this.reviewCount = data.reviewCount;
  }
}

function validateAppointmentMetrics(metrics: AppointmentReportMetrics): void {
  validateCount(metrics.total, 'El total de citas');
  validateCount(metrics.pending, 'Las citas pendientes');
  validateCount(metrics.completed, 'Las citas completadas');
  validateCount(metrics.cancelled, 'Las citas canceladas');
  validateCount(metrics.notPerformed, 'Las citas no realizadas');
  for (const point of [...metrics.weekly, ...metrics.monthly]) {
    if (!point.period.trim()) throw new InvalidReportError('Cada serie debe identificar su período.');
    validateCount(point.total, 'El total de citas por período');
    validateCount(point.pending, 'Las citas pendientes por período');
    validateCount(point.completed, 'Las citas completadas por período');
    validateCount(point.cancelled, 'Las citas canceladas por período');
    validateCount(point.notPerformed, 'Las citas no realizadas por período');
  }
}

function validateCount(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new InvalidReportError(`${label} debe ser un número mayor o igual a cero.`);
  }
}