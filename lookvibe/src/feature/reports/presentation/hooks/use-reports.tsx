'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { toHttpErrorMessage } from '../../../../shared/presentation/http-error-message';
import { InvalidReportError } from '../../domain/errors/invalid-report-error';
import type { BusinessReport } from '../../domain/entities/business-report';
import type { UsageReport } from '../../domain/entities/usage-report';
import { reportsContainer } from '../../di/reports.container';
import { ReportPeriod } from '../../domain/value-objects/report-period';

interface ReportLoadingState {
  businesses: boolean;
  report: boolean;
  usage: boolean;
  download: boolean;
}

interface ReportsContextValue {
  businesses: { id: string; name: string }[];
  businessReport: BusinessReport | null;
  usageReport: UsageReport | null;
  loading: ReportLoadingState;
  error: string | null;
  loadMyBusinesses: () => Promise<{ id: string; name: string }[]>;
  loadBusinessReport: (businessId: string, from: string, to: string) => Promise<BusinessReport | null>;
  loadUsageReport: () => Promise<UsageReport | null>;
  downloadBusinessReport: (businessId: string, from: string, to: string) => Promise<Uint8Array | null>;
}

const ReportsContext = createContext<ReportsContextValue | null>(null);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([]);
  const [businessReport, setBusinessReport] = useState<BusinessReport | null>(null);
  const [usageReport, setUsageReport] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState<ReportLoadingState>({
    businesses: false,
    report: false,
    usage: false,
    download: false,
  });
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async <T,>(key: keyof ReportLoadingState, operation: () => Promise<T>): Promise<T | null> => {
    setError(null);
    setLoading((current) => ({ ...current, [key]: true }));
    try {
      return await operation();
    } catch (reason: unknown) {
      setError(reason instanceof InvalidReportError
        ? reason.message
        : toHttpErrorMessage(reason, 'No se pudo cargar el reporte.'));
      return null;
    } finally {
      setLoading((current) => ({ ...current, [key]: false }));
    }
  }, []);

  const loadMyBusinesses = useCallback(async () => {
    const result = await run('businesses', () => reportsContainer.getMyBusinesses.execute());
    const list = result ?? [];
    setBusinesses(list);
    return list;
  }, [run]);

  const loadBusinessReport = useCallback(async (businessId: string, from: string, to: string) => {
    const result = await run('report', async () => {
      const period = ReportPeriod.create(from, to);
      return reportsContainer.getBusinessReport.execute(businessId, period);
    });
    setBusinessReport(result);
    return result;
  }, [run]);

  const loadUsageReport = useCallback(async () => {
    const result = await run('usage', () => reportsContainer.getUsageReport.execute());
    setUsageReport(result);
    return result;
  }, [run]);

  const downloadBusinessReport = useCallback((businessId: string, from: string, to: string) =>
    run('download', async () => {
      const period = ReportPeriod.create(from, to);
      return reportsContainer.downloadBusinessReport.execute(businessId, period);
    }), [run]);

  const value = useMemo<ReportsContextValue>(() => ({
    businesses,
    businessReport,
    usageReport,
    loading,
    error,
    loadMyBusinesses,
    loadBusinessReport,
    loadUsageReport,
    downloadBusinessReport,
  }), [
    businesses,
    businessReport,
    usageReport,
    loading,
    error,
    loadMyBusinesses,
    loadBusinessReport,
    loadUsageReport,
    downloadBusinessReport,
  ]);

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

export function useReports(): ReportsContextValue {
  const context = useContext(ReportsContext);
  if (!context) throw new Error('useReports debe usarse dentro de ReportsProvider.');
  return context;
}