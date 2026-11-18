'use client';

import Link from 'next/link';
import { BookingLink } from '../../../appointments/presentation/components/booking-link';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';

interface BusinessActionsProps {
  bookable: boolean;
  businessId: string;
}

export function BusinessActions({ bookable, businessId }: BusinessActionsProps) {
  const session = useCurrentSession();
  if (!bookable) {
    return <p className="text-sm text-slate-400">Este negocio todavía no está recibiendo reservas.</p>;
  }

  if (!session) {
    return (
      <Link href="/login" className="rounded-xl bg-[#f59e0b] px-5 py-3 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300">
        Inicia sesión para reservar
      </Link>
    );
  }

  return (
    <BookingLink
      businessId={businessId}
      className="inline-flex items-center gap-2 rounded-xl bg-[#f59e0b] px-5 py-3 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300"
    >
      Reservar una cita <span aria-hidden="true">→</span>
    </BookingLink>
  );
}
