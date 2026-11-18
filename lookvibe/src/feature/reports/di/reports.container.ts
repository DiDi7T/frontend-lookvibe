import { sharedContainer } from '../../../shared/di/shared.container';
import { DownloadBusinessReportUseCase } from '../application/use-cases/download-business-report.use-case';
import { GetBusinessReportUseCase } from '../application/use-cases/get-business-report.use-case';
import { GetMyReportBusinessesUseCase } from '../application/use-cases/get-my-report-businesses.use-case';
import { GetUsageReportUseCase } from '../application/use-cases/get-usage-report.use-case';
import { HttpReportsRepository } from '../infraestructure/repositories/http-reports.repository';

const reportsRepository = new HttpReportsRepository(sharedContainer.http);

export const reportsContainer = {
  getMyBusinesses: new GetMyReportBusinessesUseCase(reportsRepository),
  getBusinessReport: new GetBusinessReportUseCase(reportsRepository),
  getUsageReport: new GetUsageReportUseCase(reportsRepository),
  downloadBusinessReport: new DownloadBusinessReportUseCase(reportsRepository),
};