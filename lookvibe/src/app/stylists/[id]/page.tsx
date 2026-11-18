import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { businessesContainer } from '../../../feature/businesses/di/businesses.container';
import { PortfolioSection } from '../../../feature/portfolio/presentation/components/portfolio-section';
import { reviewsContainer } from '../../../feature/reviews/di/reviews.container';
import { ReviewList } from '../../../feature/reviews/presentation/components/review-list';
import { stylistsContainer } from '../../../feature/stylists/di/stylists.container';
import type { Stylist } from '../../../feature/stylists/domain/entities/stylist';
import { StylistNotFoundError } from '../../../feature/stylists/domain/errors/stylist-not-found-error';
import { AffiliationCode } from '../../../feature/stylists/domain/value-objects/affiliation-code';
import { StylistProfile } from '../../../feature/stylists/presentation/components/stylist-profile';

interface StylistPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: StylistPageProps): Promise<Metadata> {
  const { id } = await params;
  const stylist = await findStylist(id);
  return {
    title: stylist ? `${stylist.displayName} | LookVibe` : 'Estilista no encontrado | LookVibe',
    description: stylist ? `${stylist.specialty}: portafolio y reseñas en LookVibe.` : 'Perfil de estilista en LookVibe.',
  };
}

export default async function StylistPage({ params, searchParams }: StylistPageProps) {
  const { id } = await params;
  const { i } = await searchParams;
  const stylist = await findStylist(id);
  if (!stylist) notFound();

  const inviteToken = (Array.isArray(i) ? i[0] : i)?.trim() || null;
  const inviteCode = inviteToken ? decodeInvitation(inviteToken) : null;
  const [reviews, invitingBusiness] = await Promise.all([
    reviewsContainer.getReviews.execute('stylist', stylist.id).catch(() => null),
    inviteCode ? businessesContainer.getBusiness.execute(inviteCode).catch(() => null) : Promise.resolve(null),
  ]);

  return (
    <StylistProfile
      stylist={stylist}
      invitation={inviteToken ? { code: inviteCode, businessName: invitingBusiness?.name ?? null } : null}
      portfolio={<PortfolioSection ownerKind="stylist" ownerId={stylist.id} />}
      reviews={
        <ReviewList
          summary={reviews}
          managers={{ userIds: [stylist.accountId, stylist.business?.ownerId], businessId: stylist.business?.id }}
        />
      }
    />
  );
}

function decodeInvitation(token: string): string | null {
  try {
    return AffiliationCode.fromInviteToken(token).value;
  } catch {
    return null;
  }
}

async function findStylist(id: string): Promise<Stylist | null> {
  try {
    return await stylistsContainer.getStylist.execute(id);
  } catch (reason: unknown) {
    if (reason instanceof StylistNotFoundError) return null;
    throw reason;
  }
}
