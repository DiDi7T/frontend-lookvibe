import type { Metadata } from 'next';
import { BusinessWorkspace } from '../../../../feature/businesses/presentation/components/business-workspace';
import { PortfolioSection } from '../../../../feature/portfolio/presentation/components/portfolio-section';
import { ServiceManager } from '../../../../feature/services/presentation/components/service-manager';
import { StylistManager } from '../../../../feature/stylists/presentation/components/stylist-manager';

export const metadata: Metadata = {
  title: 'Administrar negocio | LookVibe',
  description: 'Edita los datos, servicios, equipo, portafolio y horario de tu negocio.',
};

interface ManageBusinessPageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageBusinessPage({ params }: ManageBusinessPageProps) {
  const { id } = await params;
  return (
    <BusinessWorkspace
      businessId={id}
      servicesPanel={<ServiceManager businessId={id} />}
      stylistsPanel={<StylistManager businessId={id} />}
      portfolioPanel={<PortfolioSection ownerKind="business" ownerId={id} title="Portafolio del negocio" managingBusinessId={id} />}
    />
  );
}
