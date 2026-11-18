'use client';

import { useState, type FormEvent } from 'react';
import { FormField, inputClassName } from '../../../../shared/components/form-field';
import type { Service } from '../../domain/entities/service';
import type { ServiceDraftInput } from '../../domain/value-objects/service-draft';

interface ServiceFormProps {
  service?: Service;
  submitting: boolean;
  onSubmit: (input: ServiceDraftInput) => Promise<boolean>;
  onCancel?: () => void;
}

export function ServiceForm({ service, submitting, onSubmit, onCancel }: ServiceFormProps) {
  const prefix = service ? `service-${service.id}` : 'service-new';
  const [name, setName] = useState(service?.name ?? '');
  const [price, setPrice] = useState(service ? String(service.price.amount) : '');
  const [duration, setDuration] = useState(service ? String(service.duration.minutes) : '30');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSubmit({ name, price, durationMinutes: Number(duration) });
    if (saved && !service) {
      setName('');
      setPrice('');
      setDuration('30');
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
      <FormField label="Servicio" htmlFor={`${prefix}-name`}>
        <input
          id={`${prefix}-name`}
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej: Corte clásico"
          className={inputClassName}
        />
      </FormField>
      <FormField label="Precio (COP)" htmlFor={`${prefix}-price`}>
        <input
          id={`${prefix}-price`}
          type="number"
          required
          min={1}
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="35000"
          className={inputClassName}
        />
      </FormField>
      <FormField label="Duración (min)" htmlFor={`${prefix}-duration`}>
        <input
          id={`${prefix}-duration`}
          type="number"
          required
          min={1}
          max={480}
          step={1}
          value={duration}
          onChange={(event) => setDuration(event.target.value)}
          className={inputClassName}
        />
      </FormField>
      <div className="flex flex-wrap gap-3 sm:col-span-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-[#f59e0b] px-5 py-2.5 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {service ? 'Guardar' : 'Agregar servicio'}
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
