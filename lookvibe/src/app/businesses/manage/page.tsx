import type { Metadata } from 'next';
import { MyBusinesses } from '../../../feature/businesses/presentation/components/my-businesses';

export const metadata: Metadata = {
  title: 'Mis negocios | LookVibe',
  description: 'Administra tus negocios en LookVibe.',
};

export default function ManageBusinessesPage() {
  return <MyBusinesses />;
}
