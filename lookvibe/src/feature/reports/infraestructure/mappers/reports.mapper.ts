import { BusinessReport } from '../../domain/entities/business-report';
import { UsageReport } from '../../domain/entities/usage-report';
import { ReportPeriod } from '../../domain/value-objects/report-period';
import type { BusinessReportDto, BusinessReportSeriesDto } from '../dtos/business-report.dto';
import type { UsageReportDto } from '../dtos/usage-report.dto';

export function toBusinessReport(dto: BusinessReportDto): BusinessReport {
  return new BusinessReport({
    business: { id: dto.negocio.id, name: dto.negocio.nombre },
    period: ReportPeriod.create(dto.periodo.desde, dto.periodo.hasta),
    timezone: dto.periodo.zonaHoraria,
    appointments: {
      total: dto.citas.total,
      pending: dto.citas.pendientes,
      completed: dto.citas.completadas,
      cancelled: dto.citas.canceladas,
      notPerformed: dto.citas.noRealizadas,
      weekly: dto.citas.semanal.map(toSeriesPoint),
      monthly: dto.citas.mensual.map(toSeriesPoint),
    },
    mostRequestedService: dto.servicioMasSolicitado
      ? {
          id: dto.servicioMasSolicitado.id,
          name: dto.servicioMasSolicitado.nombre,
          count: dto.servicioMasSolicitado.cantidad,
        }
      : null,
    estimatedRevenue: dto.ingresosEstimados,
    averageRating: dto.calificacionPromedio,
    reviewCount: dto.cantidadResenas,
  });
}

export function toUsageReport(dto: UsageReportDto): UsageReport {
  return new UsageReport({
    generatedAt: dto.generadoEn,
    users: dto.usuarios,
    businesses: dto.negocios,
    activeBusinesses: dto.negociosActivos,
    appointments: dto.citas,
    reviews: dto.resenas,
    appointmentsByMonth: dto.citasPorMes.map((item) => ({
      period: item.periodo,
      appointments: item.citas,
    })),
  });
}

function toSeriesPoint(dto: BusinessReportSeriesDto) {
  return {
    period: dto.periodo,
    total: dto.total,
    pending: dto.pendientes,
    completed: dto.completadas,
    cancelled: dto.canceladas,
    notPerformed: dto.noRealizadas,
  };
}