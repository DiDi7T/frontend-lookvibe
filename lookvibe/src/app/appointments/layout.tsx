import type { ReactNode } from 'react';
import { APPOINTMENT_ROLES } from '../../feature/appointments/domain/value-objects/booking-access';
import { AppointmentsAccessGuard } from '../../feature/appointments/presentation/components/appointments-access-guard';

export default function AppointmentsLayout({ children }: { children: ReactNode }) {
  return (
    <AppointmentsAccessGuard allowedRoles={APPOINTMENT_ROLES} resourceName="la gestión de citas">
      {children}
    </AppointmentsAccessGuard>
  );
}
