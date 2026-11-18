import type { ReportsRepository } from '../repositories/reports-repository';

export class GetMyReportBusinessesUseCase {
  constructor(private readonly reports: ReportsRepository) {}

  execute(): Promise<{ id: string; name: string }[]> {
    return this.reports.getMyBusinesses();
  }
}