'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FeedbackMessage } from '../../../../shared/components/feedback-message';
import type { BusinessDraftInput } from '../../domain/value-objects/business-draft';
import { BusinessesProvider, useBusinesses } from '../hooks/use-businesses';
import { BusinessForm } from './business-form';

function NewBusinessContent() {
  const router = useRouter();
  const { createBusiness, loading, error } = useBusinesses();

  async function create(input: BusinessDraftInput) {
    const business = await createBusiness(input);
    if (business) router.push(`/businesses/manage/${business.id}`);
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-14 pt-8 text-white sm:px-6 sm:pt-12">
      <Link href="/businesses/manage" className="text-sm font-semibold text-slate-300 transition hover:text-white">
        ← Mis negocios
      </Link>
      <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">Registra tu negocio</h1>
      <p className="mt-2 text-slate-400">Después podrás agregar servicios, tu equipo y el horario de atención.</p>
      <FeedbackMessage type="error" message={error} />
      <section className="mt-6 rounded-3xl border border-white/10 bg-[#172033] p-6 sm:p-8">
        <BusinessForm submitting={loading.action} submitLabel="Crear negocio" onSubmit={create} />
      </section>
    </main>
  );
}

export function NewBusiness() {
  return <BusinessesProvider><NewBusinessContent /></BusinessesProvider>;
}
