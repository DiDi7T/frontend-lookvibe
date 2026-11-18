import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Stylist, StylistInput } from '../../domain/entities/stylist';
import { AffiliationPanel, type AffiliationInvitation } from './affiliation-panel';
import { StylistPhoto } from './stylist-photo';
import { StylistPhotoEditor } from './stylist-photo-editor';

interface StylistProfileProps {
  stylist: Stylist;
  invitation: AffiliationInvitation | null;
  portfolio: ReactNode;
  reviews: ReactNode;
}

export function StylistProfile({ stylist, invitation, portfolio, reviews }: StylistProfileProps) {
  const stylistInput: StylistInput = {
    id: stylist.id,
    name: stylist.name,
    specialty: stylist.specialty,
    photoUrl: stylist.photoUrl,
    affiliation: stylist.affiliation.value,
    business: stylist.business,
    requestedBusiness: stylist.requestedBusiness,
    accountId: stylist.accountId,
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-14 pt-8 text-white sm:px-6 sm:pt-12">
      <Link
        href={stylist.business ? `/businesses/${stylist.business.id}` : '/businesses'}
        className="text-sm font-semibold text-slate-300 transition hover:text-white"
      >
        ← {stylist.business ? `Volver a ${stylist.business.name}` : 'Ver negocios'}
      </Link>

      <section className="mt-5 flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-[#172033] p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="flex flex-col items-center sm:items-start">
          <StylistPhoto name={stylist.displayName} initials={stylist.initials} photoUrl={stylist.photoUrl} />
          <StylistPhotoEditor stylist={stylistInput} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f9c784]">Perfil profesional</p>
          <h1 className="mt-1 font-display text-3xl font-bold">{stylist.displayName}</h1>
          {stylist.name && <p className="mt-1 text-slate-300">{stylist.specialty}</p>}
          <p className="mt-3 text-sm text-slate-400">
            {stylist.business ? (
              <>
                Atiende en{' '}
                <Link href={`/businesses/${stylist.business.id}`} className="font-semibold text-[#f9c784] hover:underline">
                  {stylist.business.name}
                </Link>
              </>
            ) : (
              'Estilista independiente'
            )}
          </p>
        </div>
      </section>

      <AffiliationPanel stylist={stylistInput} invitation={invitation} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {portfolio}
        <section aria-labelledby="stylist-reviews" className="space-y-4">
          <h2 id="stylist-reviews" className="font-display text-xl font-bold">Reseñas</h2>
          {reviews}
        </section>
      </div>
    </main>
  );
}
