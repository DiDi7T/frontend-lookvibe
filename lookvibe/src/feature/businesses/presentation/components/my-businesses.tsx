'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { FeedbackMessage } from '../../../../shared/components/feedback-message';
import { BusinessesProvider, useBusinesses } from '../hooks/use-businesses';
import { BusinessStatusBadge } from './business-status-badge';

function MyBusinessesContent() {
  const { myBusinesses, loading, error, loadMyBusinesses } = useBusinesses();

  useEffect(() => {
    void loadMyBusinesses();
  }, [loadMyBusinesses]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-14 pt-8 text-white sm:px-6 sm:pt-12">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f9c784]">Tu espacio de negocio</p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Mis negocios</h1>
        </div>
        <Link href="/businesses/manage/new" className="rounded-xl bg-[#f59e0b] px-4 py-2.5 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300">
          ＋ Nuevo negocio
        </Link>
      </header>

      <FeedbackMessage type="error" message={error} />
      {loading.list && <p className="mt-6 text-center text-sm text-slate-400">Cargando tus negocios…</p>}

      {!loading.list && !error && myBusinesses.length === 0 && (
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#172033] p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#f59e0b]/10 text-2xl text-[#f9c784]">✦</span>
          <h2 className="mt-4 font-display text-lg font-bold">Aún no has registrado un negocio</h2>
          <p className="mt-2 text-sm text-slate-400">Crea tu negocio, agrega servicios, tu equipo y el horario para empezar a recibir citas.</p>
          <Link href="/businesses/manage/new" className="mt-5 inline-flex rounded-xl bg-[#f59e0b] px-5 py-3 font-display font-bold text-[#0f172a]">Crear mi negocio</Link>
        </section>
      )}

      <ul className="mt-6 space-y-4">
        {myBusinesses.map((business) => (
          <li key={business.id} className="rounded-3xl border border-white/10 bg-[#172033] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold">{business.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{business.address ?? 'Dirección por confirmar'}</p>
              </div>
              <BusinessStatusBadge status={business.status} />
            </div>
            <p className="mt-4 text-sm text-slate-300">
              {business.serviceCount} servicios · {business.stylistCount} estilistas
            </p>
            {business.missingSetup.length > 0 && (
              <p className="mt-2 text-sm text-amber-200">Para activarlo falta: {business.missingSetup.join(', ')}.</p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/businesses/manage/${business.id}`} className="rounded-xl bg-[#f59e0b] px-4 py-2.5 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300">
                Administrar
              </Link>
              {business.status.isActive && (
                <Link href={`/businesses/${business.id}`} className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-white/5">
                  Ver perfil público
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function MyBusinesses() {
  return <BusinessesProvider><MyBusinessesContent /></BusinessesProvider>;
}
