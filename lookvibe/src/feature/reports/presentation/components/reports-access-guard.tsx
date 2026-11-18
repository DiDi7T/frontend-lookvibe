'use client';

import Link from 'next/link';
import { useSyncExternalStore, type ReactNode } from 'react';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';

const subscribeToNothing = () => () => {};

export function ReportsAccessGuard({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const session = useCurrentSession();
  const canView = session?.roles.some((role) => role === 'negocio' || role === 'admin') ?? false;

  if (!isClient) return <p className="mx-auto mt-16 text-center text-sm text-slate-400">Verificando tu sesión…</p>;
  if (!session) {
    return <GuardMessage title="Inicia sesión para ver los reportes" description="Los reportes requieren una cuenta autorizada." action={<Link href="/login" className="mt-5 inline-flex rounded-xl bg-[#f59e0b] px-5 py-3 font-display font-bold text-[#0f172a]">Iniciar sesión</Link>} />;
  }
  if (!canView) {
    return <GuardMessage title="No tienes acceso a los reportes" description="Esta sección está disponible para negocios y administradores." action={<Link href="/dashboard" className="mt-5 inline-flex rounded-xl border border-white/20 px-5 py-3 font-display font-semibold text-white">Ir al panel</Link>} />;
  }
  return <>{children}</>;
}

function GuardMessage({ title, description, action }: { title: string; description: string; action: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 text-white">
      <section className="rounded-2xl border border-white/10 bg-[#172033] p-7 text-center">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
        {action}
      </section>
    </main>
  );
}