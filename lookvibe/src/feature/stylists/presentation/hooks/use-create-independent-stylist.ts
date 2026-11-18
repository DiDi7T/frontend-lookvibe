'use client';

import { useCallback, useState } from 'react';
import { toHttpErrorMessage } from '../../../../shared/presentation/http-error-message';
import type { CreateIndependentStylistInput } from '../../application/use-cases/create-independent-stylist.use-case';
import { stylistsContainer } from '../../di/stylists.container';
import type { Stylist } from '../../domain/entities/stylist';
import { InvalidStylistError } from '../../domain/errors/invalid-stylist-error';
import { StylistProfileExistsError } from '../../domain/errors/stylist-profile-exists-error';

export function useCreateIndependentStylist() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (input: CreateIndependentStylistInput): Promise<Stylist | null> => {
    setCreating(true);
    setError(null);
    try {
      return await stylistsContainer.createIndependentStylist.execute(input);
    } catch (reason: unknown) {
      if (reason instanceof StylistProfileExistsError) {
        setError('Tu cuenta ya tiene un perfil de estilista, pero fue creado desde otro navegador o antes de esta versión, así que no podemos abrirlo desde aquí.');
      } else if (reason instanceof InvalidStylistError) {
        setError(reason.message);
      } else {
        setError(toHttpErrorMessage(reason, 'No encontramos tu cuenta.') ?? 'No se pudo crear tu perfil. Inténtalo nuevamente.');
      }
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  return { create, creating, error };
}
