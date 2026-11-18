'use client';

import { useState, type FormEvent } from 'react';
import { FeedbackMessage } from '../../../../shared/components/feedback-message';
import { FormField, inputClassName } from '../../../../shared/components/form-field';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';
import type { PortfolioOwnerKind } from '../../domain/value-objects/portfolio-owner';
import { usePortfolio } from '../hooks/use-portfolio';
import { PortfolioGallery } from './portfolio-gallery';

const MANAGER_ROLES: Record<PortfolioOwnerKind, readonly string[]> = {
  business: ['negocio', 'admin'],
  stylist: ['estilista', 'negocio', 'admin'],
};

interface PortfolioSectionProps {
  ownerKind: PortfolioOwnerKind;
  ownerId: string;
  title?: string;
}

export function PortfolioSection({ ownerKind, ownerId, title = 'Portafolio' }: PortfolioSectionProps) {
  const session = useCurrentSession();
  const { items, loading, loadError, adding, error, success, add } = usePortfolio(ownerKind, ownerId);
  const [photoUrl, setPhotoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [open, setOpen] = useState(false);
  const canManage = session?.roles.some((role) => MANAGER_ROLES[ownerKind].includes(role)) ?? false;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await add({ photoUrl, description })) {
      setPhotoUrl('');
      setDescription('');
      setOpen(false);
    }
  }

  return (
    <section aria-labelledby={`portfolio-${ownerId}`} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id={`portfolio-${ownerId}`} className="font-display text-xl font-bold">{title}</h2>
        {canManage && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-xl bg-[#f59e0b] px-4 py-2 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300"
          >
            ＋ Cargar nueva foto
          </button>
        )}
      </div>

      {open && (
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-white/10 bg-[#0f172a] p-5 sm:grid-cols-2">
          <FormField label="URL de la foto" htmlFor={`portfolio-url-${ownerId}`} hint="Pega el enlace de una imagen publicada (https://…).">
            <input
              id={`portfolio-url-${ownerId}`}
              type="url"
              required
              maxLength={2048}
              value={photoUrl}
              onChange={(event) => setPhotoUrl(event.target.value)}
              placeholder="https://…/foto.jpg"
              className={inputClassName}
            />
          </FormField>
          <FormField label="Descripción" htmlFor={`portfolio-description-${ownerId}`} hint="Opcional. Máximo 255 caracteres.">
            <input
              id={`portfolio-description-${ownerId}`}
              maxLength={255}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ej: Balayage rubio"
              className={inputClassName}
            />
          </FormField>
          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={adding}
              className="rounded-xl bg-[#f59e0b] px-5 py-2.5 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:opacity-60"
            >
              {adding ? 'Guardando…' : 'Agregar al portafolio'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-white/5"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <FeedbackMessage type="error" message={error} />
      <FeedbackMessage type="success" message={success} />

      {loading ? (
        <p className="text-sm text-slate-400">Cargando portafolio…</p>
      ) : loadError ? (
        <p className="rounded-2xl border border-white/10 bg-[#172033] p-5 text-sm text-slate-400">{loadError}</p>
      ) : (
        <PortfolioGallery items={items} />
      )}
    </section>
  );
}
