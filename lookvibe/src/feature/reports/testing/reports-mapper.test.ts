import { describe, expect, it } from 'vitest';
import { toBusinessReport, toUsageReport } from '../infraestructure/mappers/reports.mapper';

describe('reports mappers', () => {
  it('maps business appointments, rating, service and estimated revenue', () => {
    const report = toBusinessReport({
      negocio: { id: 'b-1', nombre: 'LookVibe Studio' },
      periodo: { desde: '2026-01-01', hasta: '2026-01-31', zonaHoraria: 'America/Bogota' },
      citas: {
        total: 3,
        pendientes: 1,
        completadas: 1,
        canceladas: 1,
        noRealizadas: 0,
        semanal: [{ periodo: '2026-01-01', total: 2, pendientes: 1, completadas: 1, canceladas: 0, noRealizadas: 0 }],
        mensual: [],
      },
      servicioMasSolicitado: { id: 's-1', nombre: 'Corte', cantidad: 2 },
      ingresosEstimados: 80000,
      calificacionPromedio: 4.5,
      cantidadResenas: 4,
    });

    expect(report.business.name).toBe('LookVibe Studio');
    expect(report.appointments.weekly[0].completed).toBe(1);
    expect(report.mostRequestedService?.name).toBe('Corte');
    expect(report.estimatedRevenue).toBe(80000);
    expect(report.averageRating).toBe(4.5);
    expect(report.reviewCount).toBe(4);
  });

  it('maps the global admin metrics and monthly appointment series', () => {
    const report = toUsageReport({
      generadoEn: '2026-11-17T12:00:00.000Z',
      usuarios: 40,
      negocios: 12,
      negociosActivos: 9,
      citas: 150,
      resenas: 75,
      citasPorMes: [{ periodo: '2026-11', citas: 18 }],
    });

    expect(report.activeBusinesses).toBe(9);
    expect(report.appointmentsByMonth).toEqual([{ period: '2026-11', appointments: 18 }]);
  });
});