'use client';

import { useRouter } from 'next/navigation';
import { DashboardNavbar } from '../../../../shared/components/dashboard-navbar';
import { authContainer } from '../../di/auth.container';
import { useCurrentSession } from '../hooks/use-current-session';
import { canAccessAppointments, canBookAppointments } from '../../../appointments/domain/value-objects/booking-access';

export function AppNavbar() {
  const session = useCurrentSession();
  const router = useRouter();
  const canBook = canBookAppointments(session?.roles);
  const isAdmin = session?.roles.includes('admin') ?? false;
  const canManageBusinesses = session?.roles.includes('negocio') ?? false;
  const canViewReports = canManageBusinesses || isAdmin;
  const isStylist = session?.roles.includes('estilista') ?? false;

  async function logout() {
    await authContainer.logoutUseCase.execute();
    router.replace('/');
    router.refresh();
  }

  return (
    <DashboardNavbar
      userName={session?.nombre}
      userEmail={session?.email}
      isAuthenticated={session !== null}
      canBook={canBook}
      canBrowseBusinesses={!isAdmin}
      canManageBusinesses={canManageBusinesses}
      canViewReports={canViewReports}
      canModerateReviews={isAdmin}
      canViewAppointments={canAccessAppointments(session?.roles)}
      isStylist={isStylist}
      onLogout={() => { void logout(); }}
    />
  );
}
