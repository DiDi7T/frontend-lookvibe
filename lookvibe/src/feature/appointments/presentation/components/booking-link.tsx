'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';
import { canBookAppointments } from '../../domain/value-objects/booking-access';

interface BookingLinkProps {
  businessId: string;
  serviceId?: string;
  stylistId?: string;
  className?: string;
  children?: ReactNode;
}

export function BookingLink({
  businessId,
  serviceId,
  stylistId,
  className = 'rounded-xl bg-[#f59e0b] px-4 py-2 text-sm font-bold text-[#0f172a] hover:bg-amber-300',
  children = 'Agendar',
}: BookingLinkProps) {
  const session = useCurrentSession();
  if (session && !canBookAppointments(session.roles)) return null;

  const query = new URLSearchParams({ businessId });
  if (serviceId) query.set('serviceId', serviceId);
  if (stylistId) query.set('stylistId', stylistId);

  return (
    <Link href={`/appointments/new?${query.toString()}`} className={className}>
      {children}
    </Link>
  );
}
