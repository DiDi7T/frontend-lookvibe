import type { BusinessReport } from '../../domain/entities/business-report';
import { InvalidReportError } from '../../domain/errors/invalid-report-error';
import type { ReportPeriod } from '../../domain/value-objects/report-period';
import type { ReportsRepository } from '../repositories/reports-repository';

export class GetBusinessReportUseCase {
  constructor(private readonly reports: ReportsRepository) {}

  async execute(businessId: string, period: ReportPeriod): Promise<BusinessReport> {
    const id = businessId.trim();
    if (!id) throw new InvalidReportError('Selecciona un negocio para consultar su reporte.');
    return this.reports.getBusinessReport(id, period);
  }
}