'use client';

import { useState, type FormEvent } from 'react';
import { FormField, inputClassName } from '../../../../shared/components/form-field';
import type { Stylist } from '../../domain/entities/stylist';
import type { StylistDraftInput } from '../../domain/value-objects/stylist-draft';

interface StylistFormProps {
  stylist?: Stylist;
  submitting: boolean;
  onSubmit: (input: StylistDraftInput) => Promise<boolean>;
  onCancel?: () => void;
  createLabel?: string;
}

export function StylistForm({ stylist, submitting, onSubmit, onCancel, createLabel = 'Agregar al equipo' }: StylistFormProps) {
  const prefix = stylist ? `stylist-${stylist.id}` : 'stylist-new';
  const [specialty, setSpecialty] = useState(stylist?.specialty ?? '');
  const [photoUrl, setPhotoUrl] = useState(stylist?.photoUrl ?? '');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSubmit({ specialty, photoUrl });
    if (saved && !stylist) {
      setSpecialty('');
      setPhotoUrl('');
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
      <FormField label="Especialidad" htmlFor={`${prefix}-specialty`}>
        <input
          id={`${prefix}-specialty`}
          required
          maxLength={160}
          value={specialty}
          onChange={(event) => setSpecialty(event.target.value)}
          placeholder="Ej: Barbero, colorista"
          className={inputClassName}
        />
      </FormField>
      <FormField label="Foto (URL)" htmlFor={`${prefix}-photo`} hint="Opcional. Debe empezar por http o https.">
        <input
          id={`${prefix}-photo`}
          type="url"
          maxLength={2048}
          value={photoUrl}
          onChange={(event) => setPhotoUrl(event.target.value)}
          placeholder="https://…"
          className={inputClassName}
        />
      </FormField>
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#f59e0b] px-5 py-2.5 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {stylist ? 'Guardar' : createLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-white/5"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
