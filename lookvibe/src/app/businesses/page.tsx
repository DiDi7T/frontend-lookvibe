import type { Metadata } from 'next';
import { businessesContainer } from '../../feature/businesses/di/businesses.container';
import { BusinessCatalog } from '../../feature/businesses/presentation/components/business-catalog';
import type { CatalogFilters } from '../../feature/businesses/presentation/components/business-filters';

export const metadata: Metadata = {
  title: 'Negocios | LookVibe',
  description: 'Explora los negocios de belleza activos en LookVibe y encuentra los más cercanos.',
};

type SearchParams = { [key: string]: string | string[] | undefined };

interface BusinessesPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function BusinessesPage({ searchParams }: BusinessesPageProps) {
  const params = await searchParams;
  const filters = toFilters(params);
  const page = Number(firstValue(params.page)) || 1;

  const result = await businessesContainer.searchBusinesses.execute({
    query: filters.query,
    service: filters.service,
    maxPrice: filters.maxPrice ?? undefined,
    near: filters.near ?? undefined,
    page,
  });

  return <BusinessCatalog result={result} filters={filters} />;
}

function toFilters(params: SearchParams): CatalogFilters {
  const latitude = Number(firstValue(params.lat));
  const longitude = Number(firstValue(params.lng));
  const radiusKm = Number(firstValue(params.radio)) || 5;
  const maxPrice = Number(firstValue(params.precioMax));
  const hasLocation = firstValue(params.lat) !== '' && Number.isFinite(latitude) && Number.isFinite(longitude);

  return {
    query: firstValue(params.q),
    service: firstValue(params.servicio),
    maxPrice: maxPrice > 0 ? maxPrice : null,
    near: hasLocation ? { latitude, longitude, radiusKm } : null,
  };
}

function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
}
