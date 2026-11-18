'use client';

import { useCallback, useState } from 'react';
import { toHttpErrorMessage } from '../../../../shared/presentation/http-error-message';
import type { RequestAffiliationInput } from '../../application/use-cases/request-affiliation.use-case';
import { stylistsContainer } from '../../di/stylists.container';
import { AffiliationError } from '../../domain/errors/affiliation-error';
import { InvalidStylistError } from '../../domain/errors/invalid-stylist-error';

export function useRequestAffiliation() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (input: RequestAffiliationInput) => {
    setSending(true);
    setError(null);
    try {
      await stylistsContainer.requestAffiliation.execute(input);
      return true;
    } catch (reason: unknown) {
      setError(
        reason instanceof AffiliationError || reason instanceof InvalidStylistError
          ? reason.message
          : toHttpErrorMessage(reason, 'No encontramos tu perfil.') ?? 'No se pudo enviar la solicitud. Inténtalo nuevamente.',
      );
      return false;
    } finally {
      setSending(false);
    }
  }, []);

  return { request, sending, error };
}
