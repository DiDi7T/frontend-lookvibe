'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ReviewPermissionsProvider } from '../hooks/use-review-permissions';
import { useModerationQueue } from '../hooks/use-moderation-queue';
import { ReviewActions } from './review-actions';
import { ReviewStars } from './review-stars';

type ModerationFilter = 'reported' | 'all';

const NO_MANAGERS = { userIds: [] };
const dateFormatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });

export function ReviewModerationBoard() {
  const { queue, error, loading, reload, removeLocally } = useModerationQueue();
  const [filter, setFilter] = useState<ModerationFilter>('reported');
  const reportedCount = queue?.reported.length ?? 0;
  const totalCount = queue?.items.length ?? 0;
  const shown = filter === 'reported' ? queue?.reported ?? [] : queue?.items ?? [];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-14 pt-8 text-white sm:px-6 sm:pt-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f9c784]">Administración</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Moderar reseñas</h1>
        <button
          type="button"
          onClick={reload}
          className="rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/5"
        >
          ↻ Actualizar
        </button>
      </div>
      <p className="mt-2 text-sm text-slate-400">
        Las reseñas reportadas siguen visibles al público hasta que decidas eliminarlas por incumplir las políticas.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/5 bg-[#172033] p-1.5">
        <button
          type="button"
          onClick={() => setFilter('reported')}
          className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${filter === 'reported' ? 'bg-[#0f172a] text-[#f9c784]' : 'text-slate-400 hover:text-white'}`}
        >
          ⚑ Reportadas ({reportedCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${filter === 'all' ? 'bg-[#0f172a] text-[#f9c784]' : 'text-slate-400 hover:text-white'}`}
        >
          Todas ({totalCount})
        </button>
      </div>

      {loading && <p className="mt-6 text-center text-sm text-slate-400">Cargando reseñas…</p>}
      {error && (
        <p role="alert" className="mt-6 rounded-xl border border-red-300/25 bg-red-950/30 p-4 text-sm text-red-200">
          {error}
        </p>
      )}

      {queue && shown.length === 0 && (
        <section className="mt-6 rounded-3xl border border-white/10 bg-[#172033] p-7 text-center">
          <h2 className="font-display text-lg font-bold">
            {filter === 'reported' ? 'No hay reseñas reportadas' : 'Aún no hay reseñas'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {filter === 'reported' ? 'Cuando un negocio o estilista reporte una reseña, aparecerá aquí.' : 'Las reseñas de los clientes aparecerán aquí.'}
          </p>
        </section>
      )}

      {shown.length > 0 && (
        <ReviewPermissionsProvider managers={NO_MANAGERS}>
          <ul className="mt-6 space-y-3">
            {shown.map(({ review, target }) => (
              <li key={review.id} className="rounded-2xl border border-white/10 bg-[#172033] p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={target.kind === 'business' ? `/businesses/${target.id}` : `/stylists/${target.id}`}
                    className="text-xs font-semibold uppercase tracking-wide text-[#f9c784] hover:underline"
                  >
                    {target.kind === 'business' ? 'Negocio' : 'Estilista'} · {target.name}
                  </Link>
                  {review.reported && (
                    <span className="rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-2.5 py-0.5 text-xs font-semibold text-[#f9c784]">
                      ⚑ Reportada
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display font-semibold">{review.author}</p>
                  <ReviewStars value={review.rating.value} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-300">{review.comment}</p>
                <p className="mt-2 text-xs text-slate-500">{dateFormatter.format(review.createdAt)}</p>
                <ReviewActions reviewId={review.id} reported={review.reported} onDone={() => removeLocally(review.id)} />
              </li>
            ))}
          </ul>
        </ReviewPermissionsProvider>
      )}
    </main>
  );
}
