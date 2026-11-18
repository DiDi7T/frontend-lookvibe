'use client';

import { useState, useSyncExternalStore, type FormEvent } from 'react';
import { CopyCode } from '../../../../shared/components/copy-code';
import { inputClassName } from '../../../../shared/components/form-field';
import { AffiliationCode } from '../../domain/value-objects/affiliation-code';

interface AffiliationInviteProps {
  businessId: string;
  accepting: boolean;
  onAccept: (stylistCode: string) => Promise<boolean>;
}

const subscribeToNothing = () => () => {};

export function AffiliationInvite({ businessId, accepting, onAccept }: AffiliationInviteProps) {
  const [stylistCode, setStylistCode] = useState('');
  const origin = useSyncExternalStore(subscribeToNothing, () => window.location.origin, () => '');
  const inviteLink = `${origin}/stylists/me?i=${AffiliationCode.create(businessId, 'código del negocio').toInviteToken()}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await onAccept(stylistCode)) setStylistCode('');
  }

  return (
    <div className="mt-6 grid gap-5 rounded-2xl border border-[#f59e0b]/20 bg-[#0f172a] p-5 lg:grid-cols-2">
      <div className="space-y-3">
        <h3 className="font-display font-semibold">1. Invita a tus estilistas</h3>
        <p className="text-sm text-slate-400">
          Envía este enlace a los estilistas de tu equipo que ya tienen cuenta en LookVibe. Con un clic te piden unirse a
          tu negocio.
        </p>
        {origin && <CopyCode label="Enlace de invitación" code={inviteLink} />}
        <details className="text-xs text-slate-500">
          <summary className="cursor-pointer font-semibold text-slate-400 hover:text-slate-200">¿Prefieres darles un código?</summary>
          <div className="mt-3">
            <CopyCode label="Código de invitación" code={businessId} />
          </div>
        </details>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <h3 className="font-display font-semibold">2. Acepta a quien te pidió unirse</h3>
        <p className="text-sm text-slate-400">
          Cuando el estilista te envíe su código, pégalo aquí para confirmar que hace parte de tu equipo.
        </p>
        <label htmlFor="stylist-code" className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
          Código del estilista
        </label>
        <input
          id="stylist-code"
          required
          value={stylistCode}
          onChange={(event) => setStylistCode(event.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          className={`${inputClassName} font-mono`}
        />
        <button
          type="submit"
          disabled={accepting}
          className="rounded-xl bg-[#f59e0b] px-5 py-2.5 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:opacity-60"
        >
          {accepting ? 'Validando…' : 'Aceptar en mi equipo'}
        </button>
      </form>
    </div>
  );
}
