'use client';

import { useCallback, useRef, useState } from 'react';
import { businessesContainer } from '../../di/businesses.container';
import { InvalidBusinessError } from '../../domain/errors/invalid-business-error';
import type { AddressSuggestion } from '../../domain/value-objects/address-suggestion';
import type { Coordinates } from './use-current-location';

export function useAddressSearch() {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pinAddress, setPinAddress] = useState<string | null>(null);
  const latestDescribe = useRef(0);

  const search = useCallback(async (query: string) => {
    setSearching(true);
    setError(null);
    setSuggestions([]);
    try {
      const found = await businessesContainer.searchAddress.execute(query);
      setSuggestions(found);
      if (found.length === 0) {
        setError('No encontramos esa dirección. Prueba con "Carrera 39 44-61, Cali" o marca el punto en el mapa.');
      }
    } catch (reason: unknown) {
      setError(reason instanceof InvalidBusinessError ? reason.message : 'No pudimos buscar la dirección. Intenta de nuevo.');
    } finally {
      setSearching(false);
    }
  }, []);

  const describe = useCallback(async (coordinates: Coordinates) => {
    const request = ++latestDescribe.current;
    setPinAddress(null);
    try {
      const label = await businessesContainer.describeLocation.execute(coordinates);
      if (request === latestDescribe.current) setPinAddress(label);
    } catch {
      if (request === latestDescribe.current) setPinAddress(null);
    }
  }, []);

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  return { suggestions, searching, error, pinAddress, search, describe, clearSuggestions };
}
