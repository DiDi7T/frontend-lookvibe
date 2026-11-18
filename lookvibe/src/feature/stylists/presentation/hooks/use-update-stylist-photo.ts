'use client';

import { useCallback, useState } from 'react';
import { toHttpErrorMessage } from '../../../../shared/presentation/http-error-message';
import { stylistsContainer } from '../../di/stylists.container';
import { InvalidStylistError } from '../../domain/errors/invalid-stylist-error';

export function useUpdateStylistPhoto() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePhoto = useCallback(async (input: { stylistId: string; specialty: string; photoUrl: string }) => {
    setSaving(true);
    setError(null);
    try {
      await stylistsContainer.updateStylist.execute(input);
      return true;
    } catch (reason: unknown) {
      setError(
        reason instanceof InvalidStylistError
          ? reason.message
          : toHttpErrorMessage(reason, 'El perfil ya no existe.') ?? 'No se pudo cambiar la foto. Inténtalo nuevamente.',
      );
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { updatePhoto, saving, error };
}
