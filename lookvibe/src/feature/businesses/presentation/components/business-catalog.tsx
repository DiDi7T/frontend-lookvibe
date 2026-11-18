import { Pagination } from '../../../../shared/components/pagination';
import { formatCurrency } from '../../../../shared/presentation/formatters';
import type { BusinessSearchResult } from '../../application/use-cases/search-businesses.use-case';
import type { BusinessPage } from '../../domain/value-objects/business-page';
import { BusinessCard } from './business-card';
import { BusinessFilters, type CatalogFilters } from './business-filters';
import { CatalogLayout } from './catalog-layout';
import { BusinessesMap, type BusinessMarker } from './maps/businesses-map';

interface BusinessCatalogProps {
  result: BusinessPage<BusinessSearchResult>;
  filters: CatalogFilters;
}

export function BusinessCatalog({ result, filters }: BusinessCatalogProps) {
  const filtered = Boolean(filters.query || filters.service || filters.maxPrice || filters.near);
  const markers: BusinessMarker[] = result.items.flatMap(({ business }) =>
    business.location
      ? [{
          id: business.id,
          name: business.name,
          address: business.address ?? 'Dirección por confirmar',
          latitude: business.location.latitude,
          longitude: business.location.longitude,
          priceLabel: business.startingPrice === null ? null : formatCurrency(business.startingPrice),
        }]
      : [],
  );

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-14 pt-8 text-white sm:px-6 sm:pt-12">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f9c784]">Descubre LookVibe</p>
        <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">Negocios de belleza</h1>
        <p className="mt-3 max-w-2xl text-slate-300">
          Encuentra barberías, peluquerías y spas activos cerca de ti, conoce sus servicios y a su equipo.
        </p>
      </header>

      <BusinessFilters
        key={JSON.stringify(filters)}
        initial={filters}
      />

      <CatalogLayout
        summary={
          <p className="font-display text-xl font-bold">
            Resultados <span className="text-base font-normal text-slate-400">({result.total} {result.total === 1 ? 'negocio' : 'negocios'})</span>
          </p>
        }
        map={<BusinessesMap markers={markers} userLocation={filters.near} />}
        list={
          <>
            {result.items.length === 0 ? (
              <section className="rounded-3xl border border-white/10 bg-[#172033] p-8 text-center">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#f59e0b]/10 text-2xl text-[#f9c784]">✦</span>
                <h2 className="mt-4 font-display text-lg font-bold">No encontramos negocios</h2>
                <p className="mt-2 text-sm text-slate-400">
                  {filtered ? 'Prueba con otro filtro o un radio más amplio.' : 'Todavía no hay negocios activos en LookVibe.'}
                </p>
              </section>
            ) : (
              <ul className="grid gap-5 xl:grid-cols-2">
                {result.items.map((item) => (
                  <BusinessCard key={item.business.id} result={item} />
                ))}
              </ul>
            )}
            <Pagination
              basePath="/businesses"
              page={result.page}
              totalPages={result.totalPages}
              params={{
                q: filters.query || undefined,
                servicio: filters.service || undefined,
                precioMax: filters.maxPrice ? String(filters.maxPrice) : undefined,
                lat: filters.near ? filters.near.latitude.toFixed(6) : undefined,
                lng: filters.near ? filters.near.longitude.toFixed(6) : undefined,
                radio: filters.near ? String(filters.near.radiusKm) : undefined,
              }}
            />
          </>
        }
      />
    </main>
  );
}
