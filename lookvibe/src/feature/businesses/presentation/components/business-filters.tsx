'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { inputClassName } from '../../../../shared/components/form-field';
import { formatCurrency } from '../../../../shared/presentation/formatters';
import { SEARCH_RADIUS_OPTIONS_KM } from '../../domain/value-objects/search-radius';
import { useCurrentLocation, type Coordinates } from '../hooks/use-current-location';

const PRICE_OPTIONS = [30000, 50000, 80000, 120000, 200000];

export interface CatalogFilters {
  query: string;
  service: string;
  maxPrice: number | null;
  near: (Coordinates & { radiusKm: number }) | null;
}

export function catalogHref(filters: CatalogFilters): string {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set('q', filters.query.trim());
  if (filters.service.trim()) params.set('servicio', filters.service.trim());
  if (filters.maxPrice) params.set('precioMax', String(filters.maxPrice));
  if (filters.near) {
    params.set('lat', filters.near.latitude.toFixed(6));
    params.set('lng', filters.near.longitude.toFixed(6));
    params.set('radio', String(filters.near.radiusKm));
  }
  const text = params.toString();
  return text ? `/businesses?${text}` : '/businesses';
}

export function BusinessFilters({ initial }: { initial: CatalogFilters }) {
  const router = useRouter();
  const { locate, locating, error } = useCurrentLocation();
  const [query, setQuery] = useState(initial.query);
  const [service, setService] = useState(initial.service);
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice ? String(initial.maxPrice) : '');
  const [radiusKm, setRadiusKm] = useState(initial.near?.radiusKm ?? 5);

  const current = (): CatalogFilters => ({
    query,
    service,
    maxPrice: maxPrice ? Number(maxPrice) : null,
    near: initial.near ? { ...initial.near, radiusKm } : null,
  });

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(catalogHref(current()));
  }

  async function searchNearMe() {
    const location = await locate();
    if (location) router.push(catalogHref({ ...current(), near: { ...location, radiusKm } }));
  }

  function clear() {
    setQuery('');
    setService('');
    setMaxPrice('');
    router.push('/businesses');
  }

  return (
    <form onSubmit={apply} role="search" className="mt-8 rounded-3xl border border-white/10 bg-[#172033] p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-200">
          Nombre o dirección
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej: Barbería, Chapinero" className={inputClassName} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-200">
          Servicio
          <input value={service} onChange={(event) => setService(event.target.value)} placeholder="Ej: Corte de cabello" className={inputClassName} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-200">
          Precio máximo
          <select value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} className={inputClassName}>
            <option value="">Cualquier precio</option>
            {PRICE_OPTIONS.map((price) => (
              <option key={price} value={price}>Hasta {formatCurrency(price)}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-200">
          Radio de búsqueda
          <select value={radiusKm} onChange={(event) => setRadiusKm(Number(event.target.value))} className={inputClassName}>
            {SEARCH_RADIUS_OPTIONS_KM.map((option) => (
              <option key={option} value={option}>{option} km</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" className="rounded-xl bg-[#f59e0b] px-5 py-3 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300">
          Buscar
        </button>
        <button
          type="button"
          onClick={searchNearMe}
          disabled={locating}
          className="rounded-xl border border-[#10b981]/40 bg-[#10b981]/10 px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-[#10b981]/20 disabled:opacity-60"
        >
          {locating ? 'Buscando tu ubicación…' : '◎ Cerca de mí'}
        </button>
        <button
          type="button"
          onClick={clear}
          className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-white/5"
        >
          Limpiar
        </button>
        {initial.near && (
          <span className="rounded-full border border-[#10b981]/40 bg-[#10b981]/10 px-3 py-1 text-xs font-semibold text-emerald-200">
            Mostrando negocios a menos de {initial.near.radiusKm} km de ti
          </span>
        )}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-200">{error}</p>}
    </form>
  );
}
