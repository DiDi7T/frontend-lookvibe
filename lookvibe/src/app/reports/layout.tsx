import type { ReactNode } from 'react';
import { ReportsProvider } from '../../feature/reports/presentation/hooks/use-reports';
import { ReportsAccessGuard } from '../../feature/reports/presentation/components/reports-access-guard';

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return <ReportsAccessGuard><ReportsProvider>{children}</ReportsProvider></ReportsAccessGuard>;
}