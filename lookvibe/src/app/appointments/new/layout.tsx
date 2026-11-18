import type { ReactNode } from 'react';
import { AppointmentsAccessGuard } from '../../../feature/appointments/presentation/components/appointments-access-guard';

const bookingRoles = ['cliente', 'admin'] as const;

export default function NewAppointmentLayout({ children }: { children: ReactNode }) {
  return (
    <AppointmentsAccessGuard allowedRoles={bookingRoles} resourceName="la reserva de citas">
      {children}
    </AppointmentsAccessGuard>
  );
}
