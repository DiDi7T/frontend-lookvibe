import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { businessesContainer } from '../../../feature/businesses/di/businesses.container';
import type { Business } from '../../../feature/businesses/domain/entities/business';
import { BusinessNotFoundError } from '../../../feature/businesses/domain/errors/business-not-found-error';
import { BusinessActions } from '../../../feature/businesses/presentation/components/business-actions';
import { BusinessDetail } from '../../../feature/businesses/presentation/components/business-detail';
import { PortfolioSection } from '../../../feature/portfolio/presentation/components/portfolio-section';
import { reviewsContainer } from '../../../feature/reviews/di/reviews.container';
import { ReviewList } from '../../../feature/reviews/presentation/components/review-list';
import { servicesContainer } from '../../../feature/services/di/services.container';
import { ServiceMenu } from '../../../feature/services/presentation/components/service-menu';
import { stylistsContainer } from '../../../feature/stylists/di/stylists.container';
import { StylistTeam } from '../../../feature/stylists/presentation/components/stylist-team';

interface BusinessPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { id } = await params;
  const business = await findBusiness(id);
  return {
    title: business ? `${business.name} | LookVibe` : 'Negocio no encontrado | LookVibe',
    description: business?.description ?? 'Conoce los servicios y el equipo de este negocio en LookVibe.',
  };
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { id } = await params;
  const business = await findBusiness(id);
  if (!business) notFound();

  const [services, stylists, reviews] = await Promise.all([
    servicesContainer.getBusinessServices.execute(business.id),
    stylistsContainer.getBusinessStylists.execute(business.id),
    reviewsContainer.getReviews.execute('business', business.id).catch(() => null),
  ]);

  return (
    <BusinessDetail
      business={business}
      actions={<BusinessActions bookable={business.isBookable} businessId={business.id} />}
      services={<ServiceMenu services={services} businessId={business.id} />}
      stylists={<StylistTeam stylists={stylists} businessId={business.id} />}
      portfolio={<PortfolioSection ownerKind="business" ownerId={business.id} title="Portafolio del negocio" />}
      reviews={<ReviewList summary={reviews} managers={{ userIds: [], businessId: business.id }} />}
    />
  );
}

async function findBusiness(id: string): Promise<Business | null> {
  try {
    return await businessesContainer.getBusiness.execute(id);
  } catch (reason: unknown) {
    if (reason instanceof BusinessNotFoundError) return null;
    throw reason;
  }
}
