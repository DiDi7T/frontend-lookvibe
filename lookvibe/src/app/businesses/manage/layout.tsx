import type { ReactNode } from 'react';
import { BusinessOwnerGuard } from '../../../feature/businesses/presentation/components/business-owner-guard';

export default function ManageBusinessesLayout({ children }: { children: ReactNode }) {
  return <BusinessOwnerGuard>{children}</BusinessOwnerGuard>;
}
