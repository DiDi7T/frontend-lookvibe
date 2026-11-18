'use client';

import { useState, type FormEvent } from 'react';
import { FormField, inputClassName } from '../../../../shared/components/form-field';
import type { Business } from '../../domain/entities/business';
import type { BusinessDraftInput } from '../../domain/value-objects/business-draft';
import type { Coordinates } from '../hooks/use-current-location';
import { LocationPicker } from './maps/location-picker';

interface BusinessFormProps {
  business?: Business | null;
  submitting: boolean;
  submitLabel: string;
  onSubmit: (input: BusinessDraftInput) => void;
}

export function BusinessForm({ business, submitting, submitLabel, onSubmit }: BusinessFormProps) {
  const [name, setName] = useState(business?.name ?? '');
  const [description, setDescription] = useState(business?.description ?? '');
  const [address, setAddress] = useState(business?.address ?? '');
  const [location, setLocation] = useState<Coordinates | null>(
    business?.location ? { latitude: business.location.latitude, longitude: business.location.longitude } : null,
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      name,
      description,
      address,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-5">
      <FormField label="Nombre del negocio" htmlFor="business-name">
        <input
          id="business-name"
          required
          maxLength={120}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ej: Barbería Ícono"
          className={inputClassName}
        />
      </FormField>
      <FormField label="Descripción" htmlFor="business-description" hint="Opcional. Máximo 1000 caracteres.">
        <textarea
          id="business-description"
          rows={4}
          maxLength={1000}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Cuéntale a tus clientes qué te hace especial"
          className={inputClassName}
        />
      </FormField>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-slate-200">Dirección y ubicación</legend>
        <p className="mb-1 text-xs text-slate-500">Necesaria para que los clientes te encuentren en las búsquedas cercanas.</p>
        <LocationPicker address={address} onAddressChange={setAddress} value={location} onChange={setLocation} />
      </fieldset>
      <button
        type="submit"
        disabled={submitting}
        className="justify-self-start rounded-xl bg-[#f59e0b] px-6 py-3 font-display font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Guardando…' : submitLabel}
      </button>
    </form>
  );
}
