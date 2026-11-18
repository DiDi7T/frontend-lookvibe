import type { ReactNode } from 'react';
import { AppointmentsAccessGuard } from '../../../feature/appointments/presentation/components/appointments-access-guard';

const moderatorRoles = ['admin'] as const;

export default function ReviewModerationLayout({ children }: { children: ReactNode }) {
  return (
    <AppointmentsAccessGuard allowedRoles={moderatorRoles} resourceName="la moderación de reseñas">
      {children}
    </AppointmentsAccessGuard>
  );
}
