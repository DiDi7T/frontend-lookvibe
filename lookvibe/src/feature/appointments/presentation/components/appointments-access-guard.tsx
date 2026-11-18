'use client';

import Link from 'next/link';
import { useSyncExternalStore, type ReactNode } from 'react';
import type { AppRole } from '../../../auth/domain/value-objects/app-role';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';

const subscribeToHydration = () => () => {};
const actionClass = 'mt-5 inline-flex rounded-xl bg-[#f59e0b] px-5 py-3 font-display font-bold text-[#0f172a]';

interface AppointmentsAccessGuardProps {
  children: ReactNode;
  allowedRoles: readonly AppRole[];
  resourceName: string;
}

export function AppointmentsAccessGuard({ children, allowedRoles, resourceName }: AppointmentsAccessGuardProps) {
  const isClient = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const session = useCurrentSession();
  const isAuthorized = session?.roles.some((role) => allowedRoles.includes(role)) ?? false;

  if (!isClient) return <GuardMessage title="Verificando tu sesión…" />;

  if (!session) {
    return (
      <GuardMessage
        title="Inicia sesión para continuar"
        description={`Necesitas una cuenta para acceder a ${resourceName}.`}
        action={<Link href="/login" className={actionClass}>Iniciar sesión</Link>}
      />
    );
  }

  if (!isAuthorized) {
    return (
      <GuardMessage
        title="No tienes acceso a esta sección"
        description={`Tu rol no tiene permiso para acceder a ${resourceName}.`}
        action={<Link href="/dashboard" className={actionClass}>Ir al panel</Link>}
      />
    );
  }

  return <>{children}</>;
}

function GuardMessage({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 text-white">
      <section className="rounded-3xl border border-white/10 bg-[#172033] p-7 text-center">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {description && <p className="mt-2 text-sm text-slate-400">{description}</p>}
        {action && <div>{action}</div>}
      </section>
    </main>
  );
}
