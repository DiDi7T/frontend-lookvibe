'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FeedbackMessage } from '../../../../shared/components/feedback-message';
import type { Stylist } from '../../domain/entities/stylist';
import type { StylistDraftInput } from '../../domain/value-objects/stylist-draft';
import { StylistsProvider, useStylists } from '../hooks/use-stylists';
import { AffiliationInvite } from './affiliation-invite';
import { StylistAvatar } from './stylist-avatar';
import { StylistForm } from './stylist-form';

function StylistManagerContent({ businessId }: { businessId: string }) {
  const {
    stylists,
    loading,
    error,
    success,
    loadManagedStylists,
    createStylist,
    updateStylist,
    deleteStylist,
    acceptAffiliation,
  } = useStylists();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    void loadManagedStylists(businessId);
  }, [businessId, loadManagedStylists]);

  function create(input: StylistDraftInput) {
    return createStylist({ ...input, businessId });
  }

  async function update(stylist: Stylist, input: StylistDraftInput) {
    const saved = await updateStylist({ ...input, stylistId: stylist.id });
    if (saved) setEditingId(null);
    return saved;
  }

  async function remove(stylist: Stylist) {
    if (await deleteStylist(stylist.id)) setConfirmDeleteId(null);
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold">Equipo</h2>
      <p className="mt-1 text-sm text-slate-400">Los estilistas que atienden en tu negocio.</p>
      <FeedbackMessage type="error" message={error} />
      <FeedbackMessage type="success" message={success} />

      <AffiliationInvite
        businessId={businessId}
        accepting={loading.action}
        onAccept={(stylistCode) => acceptAffiliation({ businessId, stylistCode })}
      />

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0f172a] p-5">
        <h3 className="font-display font-semibold">Agregar estilista sin cuenta</h3>
        <p className="mb-4 mt-1 text-sm text-slate-400">Para quienes no usan LookVibe: los registras tú con su especialidad.</p>
        <StylistForm submitting={loading.action} onSubmit={create} />
      </div>

      {loading.list && <p className="mt-6 text-center text-sm text-slate-400">Cargando equipo…</p>}
      {!loading.list && stylists.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-400">Todavía no has agregado estilistas.</p>
      )}

      <ul className="mt-6 space-y-3">
        {stylists.map((stylist) => (
          <li key={stylist.id} className="rounded-2xl border border-white/10 bg-[#0f172a] p-5">
            {editingId === stylist.id ? (
              <StylistForm
                stylist={stylist}
                submitting={loading.action}
                onSubmit={(input) => update(stylist, input)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-4">
                  <StylistAvatar stylist={stylist} />
                  <div className="min-w-0">
                    <p className="truncate font-display font-semibold">{stylist.displayName}</p>
                    <p className="mt-0.5 text-sm text-slate-400">
                      {stylist.name ? `${stylist.specialty} · Con cuenta propia` : 'Registrado por el negocio'}
                    </p>
                  </div>
                </div>
                {confirmDeleteId === stylist.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-red-200">¿Retirar del equipo?</span>
                    <button
                      type="button"
                      onClick={() => remove(stylist)}
                      disabled={loading.action}
                      className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
                    >
                      Sí, retirar
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-white/5"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/stylists/${stylist.id}`}
                      className="rounded-xl border border-[#f59e0b]/40 px-4 py-2 text-sm font-semibold text-[#f9c784] transition hover:bg-[#f59e0b]/10"
                    >
                      Perfil y portafolio
                    </Link>
                    <button
                      type="button"
                      onClick={() => { setEditingId(stylist.id); setConfirmDeleteId(null); }}
                      className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-white/5"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => { setConfirmDeleteId(stylist.id); setEditingId(null); }}
                      className="rounded-xl border border-red-300/30 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-950/40"
                    >
                      Retirar
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StylistManager({ businessId }: { businessId: string }) {
  return <StylistsProvider><StylistManagerContent businessId={businessId} /></StylistsProvider>;
}
