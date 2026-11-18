'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { CopyCode } from '../../../../shared/components/copy-code';
import { inputClassName } from '../../../../shared/components/form-field';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';
import { Stylist, type StylistInput } from '../../domain/entities/stylist';
import { useRequestAffiliation } from '../hooks/use-request-affiliation';

export interface AffiliationInvitation {
  code: string | null;
  businessName: string | null;
}

interface AffiliationPanelProps {
  stylist: StylistInput;
  invitation: AffiliationInvitation | null;
}

export function AffiliationPanel({ stylist: input, invitation }: AffiliationPanelProps) {
  const session = useCurrentSession();
  const router = useRouter();
  const { request, sending, error } = useRequestAffiliation();
  const [businessCode, setBusinessCode] = useState('');
  const [changing, setChanging] = useState(false);
  const stylist = Stylist.create(input);

  if (!session || !stylist.isOwnedBy(session.userId) || !stylist.canRequestAffiliation) return null;

  const invitationCode = invitation?.code ?? null;
  const invalidInvitation = invitation !== null && invitationCode === null;
  const invitationIsPending =
    invitationCode !== null && stylist.hasPendingRequest && stylist.requestedBusiness?.id === invitationCode;
  const showInvitation = invitationCode !== null && !invitationIsPending && !changing;
  const showPending = stylist.hasPendingRequest && !showInvitation && !changing;
  const showManualForm = !showInvitation && !showPending;

  async function send(code: string) {
    if (await request({ stylistId: stylist.id, businessCode: code })) {
      setBusinessCode('');
      setChanging(false);
      router.replace(`/stylists/${stylist.id}`);
      router.refresh();
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await send(businessCode);
  }

  return (
    <section aria-labelledby="affiliation-title" className="mt-6 rounded-3xl border border-[#f59e0b]/20 bg-[#172033] p-6">
      <h2 id="affiliation-title" className="font-display text-xl font-bold">
        {showInvitation ? 'Tienes una invitación' : 'Unirme a mi negocio'}
      </h2>

      {invalidInvitation && (
        <p role="alert" className="mt-3 rounded-xl border border-red-300/25 bg-red-950/30 p-4 text-sm text-red-200">
          Este enlace de invitación no es válido. Pídele a tu negocio que te lo envíe de nuevo.
        </p>
      )}

      {showInvitation && (
        <div className="mt-3 space-y-4">
          <p className="text-slate-300">
            <strong className="text-[#f9c784]">{invitation?.businessName ?? 'Un negocio'}</strong> te invitó a hacer parte de
            su equipo en LookVibe.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void send(invitationCode)}
              disabled={sending}
              className="rounded-xl bg-[#f59e0b] px-5 py-3 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:opacity-60"
            >
              {sending ? 'Enviando…' : 'Aceptar invitación'}
            </button>
            <button
              type="button"
              onClick={() => router.replace(`/stylists/${stylist.id}`)}
              className="rounded-xl border border-slate-600 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-white/5"
            >
              Ahora no
            </button>
          </div>
        </div>
      )}

      {showPending && (
        <div className="mt-3 space-y-4">
          <p className="rounded-xl border border-[#10b981]/30 bg-[#10b981]/10 p-4 text-sm text-emerald-200">
            Solicitud enviada a <strong>{stylist.requestedBusiness?.name}</strong>. Envíale tu código al negocio para que te
            acepte en su equipo.
          </p>
          <CopyCode label="Tu código de estilista" code={stylist.id} />
          <button
            type="button"
            onClick={() => setChanging(true)}
            className="text-sm font-semibold text-slate-300 underline-offset-4 hover:text-white hover:underline"
          >
            Usar el código de otro negocio
          </button>
        </div>
      )}

      {showManualForm && (
        <form onSubmit={submit} className="mt-3 space-y-3">
          <p className="text-sm text-slate-400">
            Abre el <strong>enlace de invitación</strong> que te envió tu negocio, o pega aquí su código de invitación.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              aria-label="Código de invitación del negocio"
              required
              value={businessCode}
              onChange={(event) => setBusinessCode(event.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className={`${inputClassName} font-mono`}
            />
            <button
              type="submit"
              disabled={sending}
              className="shrink-0 rounded-xl bg-[#f59e0b] px-5 py-3 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:opacity-60"
            >
              {sending ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </div>
          {changing && (
            <button
              type="button"
              onClick={() => setChanging(false)}
              className="text-sm font-semibold text-slate-300 hover:text-white"
            >
              Cancelar
            </button>
          )}
        </form>
      )}

      {error && <p role="alert" className="mt-3 text-sm text-red-200">{error}</p>}
    </section>
  );
}
