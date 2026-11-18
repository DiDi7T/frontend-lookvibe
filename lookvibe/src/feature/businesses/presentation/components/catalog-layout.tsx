'use client';

import { useState, type ReactNode } from 'react';

interface CatalogLayoutProps {
  summary: ReactNode;
  list: ReactNode;
  map: ReactNode;
}

export function CatalogLayout({ summary, list, map }: CatalogLayoutProps) {
  const [showMap, setShowMap] = useState(true);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {summary}
        <button
          type="button"
          onClick={() => setShowMap((current) => !current)}
          aria-pressed={showMap}
          className="rounded-xl border border-[#f59e0b]/40 px-4 py-2 text-sm font-semibold text-[#f9c784] transition hover:bg-[#f59e0b]/10"
        >
          {showMap ? '▢ Ocultar mapa' : '◈ Ver mapa'}
        </button>
      </div>
      <div className={`mt-6 grid gap-6 ${showMap ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]' : ''}`}>
        {showMap && (
          <div className="order-first h-80 overflow-hidden rounded-3xl border border-white/10 lg:order-last lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
            {map}
          </div>
        )}
        <div>{list}</div>
      </div>
    </>
  );
}
