'use client';

import dynamic from 'next/dynamic';
import { useState, type KeyboardEvent } from 'react';
import { FormField, inputClassName } from '../../../../../shared/components/form-field';
import type { AddressSuggestion } from '../../../domain/value-objects/address-suggestion';
import { useAddressSearch } from '../../hooks/use-address-search';
import { useCurrentLocation, type Coordinates } from '../../hooks/use-current-location';
import { MapErrorBoundary } from './map-error-boundary';
import { MapLoading } from './map-loading';

const LocationPickerMap = dynamic(() => import('./location-picker-map'), { ssr: false, loading: MapLoading });

interface LocationPickerProps {
  address: string;
  onAddressChange: (address: string) => void;
  value: Coordinates | null;
  onChange: (value: Coordinates | null) => void;
}

export function LocationPicker({ address, onAddressChange, value, onChange }: LocationPickerProps) {
  const { locate, locating, error: locationError } = useCurrentLocation();
  const { suggestions, searching, error: searchError, pinAddress, search, describe, clearSuggestions } = useAddressSearch();
  const [focus, setFocus] = useState<Coordinates | null>(null);

  function placePin(coordinates: Coordinates) {
    onChange(coordinates);
    void describe(coordinates);
  }

  function chooseSuggestion(suggestion: AddressSuggestion) {
    const coordinates = { latitude: suggestion.location.latitude, longitude: suggestion.location.longitude };
    onChange(coordinates);
    setFocus(coordinates);
    clearSuggestions();
  }

  async function useMyLocation() {
    const current = await locate();
    if (!current) return;
    placePin(current);
    setFocus(current);
  }

  function searchOnEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    void search(address);
  }

  const showPinAddress = Boolean(value && pinAddress && pinAddress !== address);

  return (
    <div className="space-y-4">
      <FormField label="Dirección" htmlFor="business-address" hint="Escríbela y presiona Buscar: te llevamos a esa calle para que ubiques el pin en la entrada exacta.">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="business-address"
            maxLength={255}
            value={address}
            onChange={(event) => onAddressChange(event.target.value)}
            onKeyDown={searchOnEnter}
            placeholder="Ej: Carrera 39 # 44-61, Cali"
            className={inputClassName}
          />
          <button
            type="button"
            onClick={() => void search(address)}
            disabled={searching}
            className="shrink-0 rounded-xl bg-[#f59e0b] px-5 py-3 font-display text-sm font-bold text-[#0f172a] transition hover:bg-amber-300 disabled:opacity-60"
          >
            {searching ? 'Buscando…' : 'Buscar en el mapa'}
          </button>
        </div>
      </FormField>

      {searchError && <p role="alert" className="text-sm text-amber-200">{searchError}</p>}

      {suggestions.length > 0 && (
        <ul aria-label="Direcciones encontradas" className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a]">
          {suggestions.map((suggestion) => (
            <li key={`${suggestion.location.latitude},${suggestion.location.longitude}`} className="border-b border-white/5 last:border-b-0">
              <button
                type="button"
                onClick={() => chooseSuggestion(suggestion)}
                className="flex w-full flex-col items-start px-4 py-3 text-left transition hover:bg-[#f59e0b]/10"
              >
                <span className="text-sm font-semibold text-white">{suggestion.label}</span>
                <span className="text-xs text-slate-400">{suggestion.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative z-0 h-72 overflow-hidden rounded-2xl border border-white/10 sm:h-80">
        <MapErrorBoundary>
          <LocationPickerMap value={value} focus={focus} onChange={placePin} />
        </MapErrorBoundary>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="rounded-xl border border-[#10b981]/40 bg-[#10b981]/10 px-4 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-[#10b981]/20 disabled:opacity-60"
        >
          {locating ? 'Buscando tu ubicación…' : '◎ Usar mi ubicación'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-400 hover:bg-white/5"
          >
            Quitar ubicación
          </button>
        )}
        <p className="text-xs text-slate-400">
          {value ? 'Ubicación marcada. Arrastra el pin hasta la entrada exacta.' : 'Busca la dirección o haz clic en el mapa donde queda tu negocio.'}
        </p>
      </div>

      {showPinAddress && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-4 text-sm">
          <p className="text-amber-100">
            <span className="font-semibold">El pin está en:</span> {pinAddress}
          </p>
          <button
            type="button"
            onClick={() => onAddressChange(pinAddress ?? address)}
            className="rounded-xl border border-[#f59e0b]/50 px-4 py-2 font-semibold text-[#f9c784] transition hover:bg-[#f59e0b]/10"
          >
            Usar esta dirección
          </button>
        </div>
      )}

      {locationError && <p role="alert" className="text-sm text-red-200">{locationError}</p>}
    </div>
  );
}
