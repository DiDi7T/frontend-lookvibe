import type { BusinessReport } from '../../domain/entities/business-report';
import type { UsageReport } from '../../domain/entities/usage-report';
import type { ReportPeriod } from '../../domain/value-objects/report-period';

export interface ReportsRepository {
  getMyBusinesses(): Promise<{ id: string; name: string }[]>;
  getBusinessReport(businessId: string, period: ReportPeriod): Promise<BusinessReport>;
  getUsageReport(): Promise<UsageReport>;
  downloadBusinessReport(businessId: string, period: ReportPeriod): Promise<Uint8Array>;
}