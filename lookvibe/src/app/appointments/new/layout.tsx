import type { ReactNode } from 'react';
import { BOOKING_ROLES } from '../../../feature/appointments/domain/value-objects/booking-access';
import { AppointmentsAccessGuard } from '../../../feature/appointments/presentation/components/appointments-access-guard';

export default function NewAppointmentLayout({ children }: { children: ReactNode }) {
  return (
    <AppointmentsAccessGuard allowedRoles={BOOKING_ROLES} resourceName="la reserva de citas">
      {children}
    </AppointmentsAccessGuard>
  );
}
