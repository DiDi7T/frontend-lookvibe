import { InvalidReportError } from '../../domain/errors/invalid-report-error';
import type { ReportPeriod } from '../../domain/value-objects/report-period';
import type { ReportsRepository } from '../repositories/reports-repository';

export class DownloadBusinessReportUseCase {
  constructor(private readonly reports: ReportsRepository) {}

  async execute(businessId: string, period: ReportPeriod): Promise<Uint8Array> {
    const id = businessId.trim();
    if (!id) throw new InvalidReportError('Selecciona un negocio para exportar su reporte.');
    return this.reports.downloadBusinessReport(id, period);
  }
}