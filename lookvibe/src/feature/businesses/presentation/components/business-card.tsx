import Link from 'next/link';
import { formatCurrency, formatDistance, formatDuration } from '../../../../shared/presentation/formatters';
import type { BusinessSearchResult } from '../../application/use-cases/search-businesses.use-case';

const SERVICES_PREVIEW = 3;

export function BusinessCard({ result }: { result: BusinessSearchResult }) {
  const { business, distanceKm } = result;
  const preview = business.services.slice(0, SERVICES_PREVIEW);

  return (
    <li className="flex flex-col rounded-3xl border border-white/10 bg-[#172033] p-5 transition hover:border-[#f59e0b]/50 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#f59e0b]/15 font-display text-lg font-bold text-[#f9c784]">
          {business.name.charAt(0).toLocaleUpperCase('es')}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-display text-lg font-bold">{business.name}</h2>
          <p className="mt-1 truncate text-sm text-slate-400">{business.address ?? 'Dirección por confirmar'}</p>
          <p className="mt-1 text-xs font-semibold text-slate-300">
            {business.stylistCount} estilistas
            {distanceKm !== null && <span className="text-emerald-300"> · {formatDistance(distanceKm)}</span>}
          </p>
        </div>
      </div>

      {preview.length > 0 ? (
        <ul className="mt-5 space-y-2">
          {preview.map((service) => (
            <li key={service.id} className="flex items-start justify-between gap-4 rounded-2xl border border-white/5 bg-[#0f172a] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{service.name}</p>
                <p className="mt-0.5 text-xs text-slate-400">{formatDuration(service.durationMinutes)}</p>
              </div>
              <p className="shrink-0 text-sm font-bold text-[#f9c784]">{formatCurrency(service.price)}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-slate-400">Este negocio todavía no publica servicios.</p>
      )}

      <Link
        href={`/businesses/${business.id}`}
        className="mt-5 inline-flex items-center justify-end gap-2 text-sm font-semibold text-[#f9c784] transition hover:text-amber-300"
      >
        {business.serviceCount > SERVICES_PREVIEW ? `Ver los ${business.serviceCount} servicios` : 'Ver negocio'}
        <span aria-hidden="true">→</span>
      </Link>
    </li>
  );
}
