import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookingForm } from '../../../feature/appointments/presentation/components/booking-form';

export const metadata: Metadata = {
  title: 'Agenda tu cita | LookVibe',
  description: 'Reserva un servicio de belleza en LookVibe.',
};

interface NewAppointmentPageProps {
  searchParams: Promise<{ businessId?: string; serviceId?: string; stylistId?: string }>;
}

export default function NewAppointmentPage({ searchParams }: NewAppointmentPageProps) {
  return (
    <Suspense fallback={<BookingPageFallback />}>
      <BookingSelection searchParams={searchParams} />
    </Suspense>
  );
}

async function BookingSelection({ searchParams }: NewAppointmentPageProps) {
  const selection = await searchParams;
  return (
    <BookingForm
      key={`${selection.businessId ?? ''}:${selection.serviceId ?? ''}:${selection.stylistId ?? ''}`}
      initialBusinessId={selection.businessId}
      initialServiceId={selection.serviceId}
      initialStylistId={selection.stylistId}
    />
  );
}

function BookingPageFallback() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 text-white sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f9c784]">Agendar cita</p>
      <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Preparando tu reserva…</h1>
      <div className="mt-6 animate-pulse space-y-4 rounded-3xl border border-white/10 bg-[#172033] p-6">
        <div className="h-12 rounded-xl bg-white/10" />
        <div className="h-28 rounded-2xl bg-white/5" />
      </div>
    </main>
  );
}
