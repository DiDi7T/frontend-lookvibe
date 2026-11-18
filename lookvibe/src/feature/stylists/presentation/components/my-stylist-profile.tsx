'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useSyncExternalStore } from 'react';
import { FeedbackMessage } from '../../../../shared/components/feedback-message';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';
import type { StylistDraftInput } from '../../domain/value-objects/stylist-draft';
import { useCreateIndependentStylist } from '../hooks/use-create-independent-stylist';
import { useMyStylistProfileId } from '../hooks/use-my-stylist-profile-id';
import { StylistForm } from './stylist-form';

const subscribeToNothing = () => () => {};

export function MyStylistProfile({ inviteToken }: { inviteToken: string | null }) {
  const isClient = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const session = useCurrentSession();
  const router = useRouter();
  const profileId = useMyStylistProfileId(isClient ? session?.userId ?? null : null);
  const { create, creating, error } = useCreateIndependentStylist();
  const canCreate = session?.roles.some((role) => role === 'estilista' || role === 'admin') ?? false;
  const inviteQuery = inviteToken ? `?i=${encodeURIComponent(inviteToken)}` : '';

  useEffect(() => {
    if (profileId) router.replace(`/stylists/${profileId}${inviteQuery}`);
  }, [profileId, inviteQuery, router]);

  async function submit(input: StylistDraftInput) {
    const stylist = await create({ ...input, userId: session?.userId ?? '' });
    if (stylist) router.push(`/stylists/${stylist.id}${inviteQuery}`);
    return stylist !== null;
  }

  if (!isClient || profileId) {
    return <p className="mx-auto mt-16 text-center text-sm text-slate-400">Abriendo tu perfil…</p>;
  }

  if (!canCreate) {
    return (
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-12 text-white">
        <section className="rounded-3xl border border-white/10 bg-[#172033] p-7 text-center">
          <h1 className="font-display text-2xl font-bold">
            {session ? 'Esta sección es para estilistas' : 'Inicia sesión como estilista'}
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {inviteToken
              ? 'Te invitaron a unirte al equipo de un negocio. Inicia sesión con tu cuenta de estilista y vuelve a abrir el enlace de invitación.'
              : 'Solo las cuentas con rol de estilista pueden tener un perfil profesional independiente.'}
          </p>
          <Link
            href={session ? '/businesses' : '/login'}
            className="mt-5 inline-flex rounded-xl bg-[#f59e0b] px-5 py-3 font-display font-bold text-[#0f172a]"
          >
            {session ? 'Ver negocios' : 'Iniciar sesión'}
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-14 pt-8 text-white sm:px-6 sm:pt-12">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f9c784]">Tu perfil profesional</p>
      <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Crea tu perfil de estilista</h1>
      <p className="mt-2 text-slate-400">
        {inviteToken
          ? 'Te invitaron a unirte al equipo de un negocio. Primero crea tu perfil y en el siguiente paso aceptas la invitación.'
          : 'Trabaja de forma independiente: tus clientes podrán ver tu especialidad, tu portafolio y tus reseñas.'}
      </p>
      <FeedbackMessage type="error" message={error} />
      <section className="mt-6 rounded-3xl border border-white/10 bg-[#172033] p-6 sm:p-8">
        <StylistForm submitting={creating} onSubmit={submit} createLabel="Crear mi perfil" />
      </section>
    </main>
  );
}
