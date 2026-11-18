import type { Metadata } from 'next';
import { NewBusiness } from '../../../../feature/businesses/presentation/components/new-business';

export const metadata: Metadata = {
  title: 'Nuevo negocio | LookVibe',
  description: 'Registra tu negocio en LookVibe.',
};

export default function NewBusinessPage() {
  return <NewBusiness />;
}
