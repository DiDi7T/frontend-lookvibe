import { describe, expect, it } from 'vitest';
import type { BusinessReport } from '../domain/entities/business-report';
import type { UsageReport } from '../domain/entities/usage-report';
import { InvalidReportError } from '../domain/errors/invalid-report-error';
import { ReportPeriod } from '../domain/value-objects/report-period';
import type { ReportsRepository } from '../application/repositories/reports-repository';
import { DownloadBusinessReportUseCase } from '../application/use-cases/download-business-report.use-case';
import { GetBusinessReportUseCase } from '../application/use-cases/get-business-report.use-case';
import { GetMyReportBusinessesUseCase } from '../application/use-cases/get-my-report-businesses.use-case';
import { GetUsageReportUseCase } from '../application/use-cases/get-usage-report.use-case';

class InMemoryReportsRepository implements ReportsRepository {
  businessQuery: { id: string; period: ReportPeriod } | null = null;
  downloadQuery: { id: string; period: ReportPeriod } | null = null;
  readonly businessReport = {} as BusinessReport;
  readonly usageReport = {} as UsageReport;
  readonly pdf = new Uint8Array([37, 80, 68, 70]);
  readonly businesses = [{ id: 'business-1', name: 'LookVibe Studio' }];

  async getMyBusinesses(): Promise<{ id: string; name: string }[]> {
    return this.businesses;
  }

  async getBusinessReport(businessId: string, period: ReportPeriod): Promise<BusinessReport> {
    this.businessQuery = { id: businessId, period };
    return this.businessReport;
  }

  async getUsageReport(): Promise<UsageReport> {
    return this.usageReport;
  }

  async downloadBusinessReport(businessId: string, period: ReportPeriod): Promise<Uint8Array> {
    this.downloadQuery = { id: businessId, period };
    return this.pdf;
  }
}

describe('ReportPeriod', () => {
  it('accepts calendar dates in ascending order', () => {
    expect(ReportPeriod.create('2026-01-01', '2026-01-31')).toMatchObject({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });
  });

  it('rejects invalid calendar dates and reversed ranges', () => {
    expect(() => ReportPeriod.create('2026-02-30', '2026-03-01')).toThrow(InvalidReportError);
    expect(() => ReportPeriod.create('2026-03-02', '2026-03-01')).toThrow(InvalidReportError);
  });
});

describe('Report use cases', () => {
  const period = ReportPeriod.create('2026-01-01', '2026-01-31');

  it('returns the businesses available to the current account', async () => {
    const repository = new InMemoryReportsRepository();
    expect(await new GetMyReportBusinessesUseCase(repository).execute()).toBe(repository.businesses);
  });

  it('requests a business report for the validated business and period', async () => {
    const repository = new InMemoryReportsRepository();
    const result = await new GetBusinessReportUseCase(repository).execute(' business-1 ', period);
    expect(result).toBe(repository.businessReport);
    expect(repository.businessQuery).toEqual({ id: 'business-1', period });
  });

  it('rejects an empty business id before calling the repository', async () => {
    const repository = new InMemoryReportsRepository();
    await expect(new GetBusinessReportUseCase(repository).execute(' ', period)).rejects.toThrow(InvalidReportError);
    expect(repository.businessQuery).toBeNull();
  });

  it('returns the admin usage report', async () => {
    const repository = new InMemoryReportsRepository();
    expect(await new GetUsageReportUseCase(repository).execute()).toBe(repository.usageReport);
  });

  it('downloads PDF bytes for the validated business and period', async () => {
    const repository = new InMemoryReportsRepository();
    expect(await new DownloadBusinessReportUseCase(repository).execute('business-1', period)).toBe(repository.pdf);
    expect(repository.downloadQuery).toEqual({ id: 'business-1', period });
  });
});