import type { HttpClient } from '../../../../shared/infrastructure/http-client';
import type { ReportsRepository } from '../../application/repositories/reports-repository';
import type { BusinessReport } from '../../domain/entities/business-report';
import type { UsageReport } from '../../domain/entities/usage-report';
import type { ReportPeriod } from '../../domain/value-objects/report-period';
import type { BusinessReportDto } from '../dtos/business-report.dto';
import type { UsageReportDto } from '../dtos/usage-report.dto';
import { toBusinessReport, toUsageReport } from '../mappers/reports.mapper';

export class HttpReportsRepository implements ReportsRepository {
  constructor(private readonly http: HttpClient) {}

  async getMyBusinesses(): Promise<{ id: string; name: string }[]> {
    const businesses = await this.http.get<{ id: string; nombre: string }[]>('/negocios/mios');
    return businesses.map(({ id, nombre }) => ({ id, name: nombre }));
  }

  async getBusinessReport(businessId: string, period: ReportPeriod): Promise<BusinessReport> {
    const query = buildPeriodQuery(period);
    const dto = await this.http.get<BusinessReportDto>(
      `/reportes/negocio/${encodeURIComponent(businessId)}?${query}`,
    );
    return toBusinessReport(dto);
  }

  async getUsageReport(): Promise<UsageReport> {
    const dto = await this.http.get<UsageReportDto>('/reportes/uso');
    return toUsageReport(dto);
  }

  async downloadBusinessReport(businessId: string, period: ReportPeriod): Promise<Uint8Array> {
    const query = buildPeriodQuery(period);
    const pdf = await this.http.getBlob(
      `/reportes/negocio/${encodeURIComponent(businessId)}/pdf?${query}`,
    );
    return new Uint8Array(await pdf.arrayBuffer());
  }
}

function buildPeriodQuery(period: ReportPeriod): string {
  const query = new URLSearchParams({ desde: period.startDate, hasta: period.endDate });
  return query.toString();
}