'use client';

import Link from 'next/link';
import { useSyncExternalStore, type ReactNode } from 'react';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';

const subscribeToNothing = () => () => {};

export function BusinessOwnerGuard({ children }: { children: ReactNode }) {
  const isClient = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const session = useCurrentSession();
  const canManage = session?.roles.includes('negocio') ?? false;

  if (!isClient) {
    return <p className="mx-auto mt-16 text-center text-sm text-slate-400">Verificando tu sesión…</p>;
  }

  if (!session) {
    return (
      <GuardMessage
        title="Inicia sesión para administrar tu negocio"
        description="Esta sección es solo para cuentas de negocio."
        action={<Link href="/login" className="mt-5 inline-flex rounded-xl bg-[#f59e0b] px-5 py-3 font-display font-bold text-[#0f172a]">Iniciar sesión</Link>}
      />
    );
  }

  if (!canManage) {
    return (
      <GuardMessage
        title="No tienes acceso a esta sección"
        description="Solo las cuentas con rol de negocio pueden gestionar negocios."
        action={<Link href="/businesses" className="mt-5 inline-flex rounded-xl border border-white/20 px-5 py-3 font-display font-semibold text-white">Ver negocios</Link>}
      />
    );
  }

  return <>{children}</>;
}

function GuardMessage({ title, description, action }: { title: string; description: string; action: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 text-white">
      <section className="rounded-3xl border border-white/10 bg-[#172033] p-7 text-center">
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
        {action}
      </section>
    </main>
  );
}
