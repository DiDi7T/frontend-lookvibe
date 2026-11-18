'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrentSession } from '../../feature/auth/presentation/hooks/use-current-session';
import { ReportsProvider } from '../../feature/reports/presentation/hooks/use-reports';
import { AdminUsageMetrics } from '../../feature/reports/presentation/components/reports-dashboard';

const subscribeToNothing = () => () => {};

export default function DashboardPage() {
  const router = useRouter();
  const isClient = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const session = useCurrentSession();

  useEffect(() => {
    if (isClient && !session) router.replace('/login');
  }, [isClient, router, session]);

  if (!isClient || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-gray-400">
        Cargando panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <main className="max-w-5xl mx-auto p-6">
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Panel Principal</h2>
          {session.roles.includes('admin') && (
            <ReportsProvider>
              <AdminUsageMetrics />
            </ReportsProvider>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/appointments"
              className="p-6 bg-[#131926] border border-gray-800 hover:border-amber-500 rounded-xl transition"
            >
              <h3 className="text-lg font-medium text-amber-400 mb-1">Gestión de Citas</h3>
              <p className="text-sm text-gray-400">
                Consulta, programa o administra tus citas según tu rol.
              </p>
            </Link>

            <Link
              href="/businesses"
              className="p-6 bg-[#131926] border border-gray-800 hover:border-amber-500 rounded-xl transition"
            >
              <h3 className="text-lg font-medium text-amber-400 mb-1">Negocios y Servicios</h3>
              <p className="text-sm text-gray-400">
                Explora los establecimientos y servicios disponibles en la plataforma.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
