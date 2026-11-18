'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { inputClassName } from '../../../../shared/components/form-field';
import { useCurrentSession } from '../../../auth/presentation/hooks/use-current-session';
import { Stylist, type StylistInput } from '../../domain/entities/stylist';
import { useUpdateStylistPhoto } from '../hooks/use-update-stylist-photo';

interface StylistPhotoEditorProps {
  stylist: StylistInput;
}

export function StylistPhotoEditor({ stylist }: StylistPhotoEditorProps) {
  const session = useCurrentSession();
  const router = useRouter();
  const { updatePhoto, saving, error } = useUpdateStylistPhoto();
  const [open, setOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(stylist.photoUrl ?? '');
  const canEdit = session ? Stylist.create(stylist).canBeManagedBy(session.userId, session.roles) : false;

  if (!canEdit) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await updatePhoto({ stylistId: stylist.id, specialty: stylist.specialty, photoUrl })) {
      setOpen(false);
      router.refresh();
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-xl border border-[#f59e0b]/40 px-3 py-2 text-xs font-semibold text-[#f9c784] transition hover:bg-[#f59e0b]/10"
      >
        {stylist.photoUrl ? 'Cambiar foto' : 'Agregar foto'}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-3 flex w-full flex-col gap-2 sm:w-64">
      <label htmlFor="stylist-photo-url" className="text-xs font-semibold text-slate-300">URL de la foto</label>
      <input
        id="stylist-photo-url"
        type="url"
        maxLength={2048}
        value={photoUrl}
        onChange={(event) => setPhotoUrl(event.target.value)}
        placeholder="https://…/foto.jpg"
        className={inputClassName}
      />
      {error && <p role="alert" className="text-xs text-red-200">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-xl bg-[#f59e0b] px-3 py-2 text-xs font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:opacity-60"
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 rounded-xl border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100 hover:bg-white/5"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
