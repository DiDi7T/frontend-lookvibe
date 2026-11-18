import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Business } from '../../domain/entities/business';
import { BusinessStatusBadge } from './business-status-badge';
import { BusinessLocationMap } from './maps/business-location-map';

interface BusinessDetailProps {
  business: Business;
  services: ReactNode;
  stylists: ReactNode;
  actions?: ReactNode;
  portfolio?: ReactNode;
  reviews?: ReactNode;
}

export function BusinessDetail({ business, services, stylists, actions, portfolio, reviews }: BusinessDetailProps) {
  const mapUrl = business.location
    ? `https://www.google.com/maps?q=${business.location.latitude},${business.location.longitude}`
    : null;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-14 pt-8 text-white sm:px-6 sm:pt-12">
      <Link href="/businesses" className="text-sm font-semibold text-slate-300 transition hover:text-white">
        ← Todos los negocios
      </Link>

      <section className="mt-5 rounded-[2rem] border border-white/10 bg-[#172033] p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#f59e0b]/15 font-display text-2xl font-bold text-[#f9c784]">
              {business.name.charAt(0).toLocaleUpperCase('es')}
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold">{business.name}</h1>
              <p className="mt-1 text-sm text-slate-400">
                {business.address ?? 'Dirección por confirmar'}
                {mapUrl && (
                  <>
                    {' · '}
                    <a href={mapUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#f9c784] hover:underline">
                      Ver en el mapa
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>
          <BusinessStatusBadge status={business.status} />
        </div>
        {business.description && <p className="mt-6 max-w-3xl leading-7 text-slate-300">{business.description}</p>}
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </section>

      {business.location && (
        <section aria-labelledby="business-location" className="mt-8">
          <h2 id="business-location" className="mb-4 font-display text-xl font-bold">Ubicación</h2>
          <BusinessLocationMap
            name={business.name}
            latitude={business.location.latitude}
            longitude={business.location.longitude}
          />
        </section>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="business-services">
          <h2 id="business-services" className="font-display text-xl font-bold">Servicios</h2>
          {services}
        </section>
        <section aria-labelledby="business-stylists">
          <h2 id="business-stylists" className="font-display text-xl font-bold">Equipo</h2>
          {stylists}
        </section>
      </div>

      {(portfolio || reviews) && (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div>{portfolio}</div>
          {reviews && (
            <section aria-labelledby="business-reviews" className="space-y-4">
              <h2 id="business-reviews" className="font-display text-xl font-bold">Reseñas</h2>
              {reviews}
            </section>
          )}
        </div>
      )}
    </main>
  );
}
