import type { UsageReport } from '../../domain/entities/usage-report';
import type { ReportsRepository } from '../repositories/reports-repository';

export class GetUsageReportUseCase {
  constructor(private readonly reports: ReportsRepository) {}

  execute(): Promise<UsageReport> {
    return this.reports.getUsageReport();
  }
}