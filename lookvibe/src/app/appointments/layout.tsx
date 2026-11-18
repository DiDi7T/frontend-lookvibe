import type { ReactNode } from 'react';
import { AppointmentsAccessGuard } from '../../feature/appointments/presentation/components/appointments-access-guard';

const appointmentRoles = ['cliente', 'negocio', 'estilista', 'admin'] as const;

export default function AppointmentsLayout({ children }: { children: ReactNode }) {
  return (
    <AppointmentsAccessGuard allowedRoles={appointmentRoles} resourceName="la gestión de citas">
      {children}
    </AppointmentsAccessGuard>
  );
}
