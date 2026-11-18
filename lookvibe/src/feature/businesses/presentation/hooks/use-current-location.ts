'use client';

import { useCallback, useState } from 'react';
import { businessesContainer } from '../../di/businesses.container';
import { InvalidBusinessError } from '../../domain/errors/invalid-business-error';
import { LocationUnavailableError } from '../../domain/errors/location-unavailable-error';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export function useCurrentLocation() {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback(async (): Promise<Coordinates | null> => {
    setLocating(true);
    setError(null);
    try {
      const location = await businessesContainer.getCurrentLocation.execute();
      return { latitude: location.latitude, longitude: location.longitude };
    } catch (reason: unknown) {
      setError(
        reason instanceof LocationUnavailableError || reason instanceof InvalidBusinessError
          ? reason.message
          : 'No pudimos obtener tu ubicación.',
      );
      return null;
    } finally {
      setLocating(false);
    }
  }, []);

  return { locate, locating, error };
}
