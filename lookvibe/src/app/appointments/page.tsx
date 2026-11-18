import type { Metadata } from 'next';
import { AppointmentsList } from '../../feature/appointments/presentation/components/appointments-list';

export const metadata: Metadata = {
  title: 'Mis citas | LookVibe',
  description: 'Consulta tus próximas citas y tu historial en LookVibe.',
};

export default function AppointmentsPage() {
  return <AppointmentsList />;
}
