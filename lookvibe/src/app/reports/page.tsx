import type { Metadata } from 'next';
import { ReportsDashboard } from '../../feature/reports/presentation/components/reports-dashboard';

export const metadata: Metadata = {
  title: 'Reportes | LookVibe',
  description: 'Métricas de rendimiento de negocios y uso de LookVibe.',
};

export default function ReportsPage() {
  return <ReportsDashboard />;
}