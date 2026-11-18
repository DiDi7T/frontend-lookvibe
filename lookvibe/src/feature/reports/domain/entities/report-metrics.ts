export interface ReportSeriesPoint {
  period: string;
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  notPerformed: number;
}

export interface AppointmentReportMetrics {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  notPerformed: number;
  weekly: ReportSeriesPoint[];
  monthly: ReportSeriesPoint[];
}

export interface UsageMonthMetric {
  period: string;
  appointments: number;
}