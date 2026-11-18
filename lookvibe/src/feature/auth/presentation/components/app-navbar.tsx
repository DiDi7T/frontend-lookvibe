'use client';

import { useRouter } from 'next/navigation';
import { DashboardNavbar } from '../../../../shared/components/dashboard-navbar';
import { authContainer } from '../../di/auth.container';
import { useCurrentSession } from '../hooks/use-current-session';

export function AppNavbar() {
  const session = useCurrentSession();
  const router = useRouter();
  const canBook = session?.roles.some((role) => role === 'cliente' || role === 'admin') ?? false;
  const canManageBusinesses = session?.roles.some((role) => role === 'negocio' || role === 'admin') ?? false;
  const canViewReports = canManageBusinesses;
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
      canManageBusinesses={canManageBusinesses}
      canViewReports={canViewReports}
      isStylist={isStylist}
      onLogout={() => { void logout(); }}
    />
  );
}
